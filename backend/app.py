"""
AI Resume & Portfolio Builder - Backend
Uses Groq API (Llama 3) for content generation
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime
from pathlib import Path
import uvicorn
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from groq import Groq

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Groq API
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key-here")
client = Groq(api_key=GROQ_API_KEY)

# Test the connection
def test_groq():
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": "Hello, respond with 'Groq is working!'"}
            ],
           model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=50,
        )
        print(chat_completion.choices[0].message.content)
        return True
    except Exception as e:
        print(f"Groq connection error: {e}")
        return False

test_groq()

# ==================== DATA MODELS ====================

class Education(BaseModel):
    school: str
    degree: str
    field: str
    graduation_year: int
    gpa: Optional[float] = None

class Experience(BaseModel):
    company: str
    position: str
    duration: str
    description: str
    skills_used: List[str] = []

class Project(BaseModel):
    title: str
    description: str
    technologies: List[str] = []
    link: Optional[str] = None
    date: str

class StudentProfile(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[Education] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    certifications: List[str] = []
    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio_website: Optional[str] = None

class ResumeRequest(BaseModel):
    profile: StudentProfile
    template_style: str = "professional"  # professional, modern, creative
    job_title: Optional[str] = None

class CoverLetterRequest(BaseModel):
    profile: StudentProfile
    company_name: str
    job_title: str
    job_description: Optional[str] = None

class PortfolioRequest(BaseModel):
    profile: StudentProfile
    theme_color: str = "blue"  # blue, purple, green, orange

# ==================== AI HELPER FUNCTIONS ====================

def generate_with_groq(prompt: str, temperature: float = 0.7, max_tokens: int = 2048) -> str:
    """
    Helper function to generate content using Groq API
    """
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a professional resume writer and career coach. Generate JSON responses only."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

# ==================== AI PROMPTS ====================

def get_resume_prompt(profile: StudentProfile, job_title: Optional[str] = None) -> str:
    """Generate optimized resume content using AI"""
    job_context = f"for a {job_title} position" if job_title else "general purpose"
    
    prompt = f"""
    Create a professional ATS-optimized resume {job_context} for a student with the following profile:
    
    Name: {profile.name}
    Location: {profile.location}
    Email: {profile.email}
    Phone: {profile.phone}
    
    Skills: {', '.join(profile.skills)}
    
    Education:
    {json.dumps([e.dict() for e in profile.education], indent=2)}
    
    Experience:
    {json.dumps([e.dict() for e in profile.experience], indent=2)}
    
    Projects:
    {json.dumps([p.dict() for p in profile.projects], indent=2)}
    
    Certifications: {', '.join(profile.certifications)}
    
    Requirements:
    1. Keep it to 1 page maximum
    2. Use action verbs and quantifiable achievements
    3. Tailor content to highlight most relevant skills
    4. Use professional language
    5. Format as JSON with sections: professional_summary, experience, education, skills, projects
    6. Make it ATS-friendly (avoid fancy formatting in text)
    7. Each section should have appropriate details and bullet points
    8. Make it compelling and impactful
    
    Return ONLY valid JSON without any markdown formatting or extra text.
    """
    
    return prompt

def get_cover_letter_prompt(profile: StudentProfile, company_name: str, job_title: str, job_description: Optional[str] = None) -> str:
    """Generate personalized cover letter using AI"""
    
    prompt = f"""
    Write a compelling, personalized cover letter for:
    
    Candidate: {profile.name}
    Target Company: {company_name}
    Position: {job_title}
    
    Candidate Profile:
    - Summary: {profile.summary or 'Not provided'}
    - Key Skills: {', '.join(profile.skills[:10])}
    - Experience: {len(profile.experience)} roles
    - Notable Projects: {', '.join([p.title for p in profile.projects[:3]])}
    - Education: {', '.join([f"{e.degree} from {e.school}" for e in profile.education])}
    
    Job Description Context: {job_description or 'Not provided - create generic cover letter'}
    
    Requirements:
    1. Professional business letter format
    2. 3-4 paragraphs (250-350 words)
    3. Opening: Show enthusiasm and specify the position
    4. Body: Highlight relevant skills and achievements
    5. Closing: Call to action and thank you
    6. Personalize with company name and specific role
    7. Show genuine interest in the company
    
    Format as JSON with sections: opening, body_paragraph_1, body_paragraph_2, closing
    Return ONLY valid JSON without any markdown formatting.
    """
    
    return prompt

def get_portfolio_prompt(profile: StudentProfile) -> str:
    """Generate portfolio page content using AI"""
    
    prompt = f"""
    Create engaging portfolio website content for:
    
    {profile.name} - {', '.join(profile.skills[:5])} Developer
    
    Profile Summary: {profile.summary}
    
    Notable Projects:
    {json.dumps([p.dict() for p in profile.projects], indent=2)}
    
    Education:
    {json.dumps([e.dict() for e in profile.education], indent=2)}
    
    Experience:
    {json.dumps([e.dict() for e in profile.experience], indent=2)}
    
    Generate JSON with:
    1. hero_section: Compelling headline and tagline
    2. about_section: Professional bio (100-150 words)
    3. featured_projects: 2-3 highlighted projects with descriptions
    4. testimonial_suggestions: Types of testimonials to seek
    5. call_to_action: Professional CTA for hiring/collaboration
    6. skills_highlight: Key skills to showcase
    
    Return ONLY valid JSON without markdown formatting.
    """
    
    return prompt

# ==================== AI GENERATION ENDPOINTS ====================

@app.post("/api/generate-resume")
async def generate_resume(request: ResumeRequest):
    """Generate AI-optimized resume"""
    try:
        prompt = get_resume_prompt(request.profile, request.job_title)
        
        # Generate content using Groq
        response_text = generate_with_groq(prompt, temperature=0.7, max_tokens=4096)
        
        # Parse JSON response
        content = response_text.strip()
        if content.startswith('```json'):
            content = content[7:]
        elif content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        
        resume_data = json.loads(content)
        
        return {
            "status": "success",
            "resume": resume_data,
            "timestamp": datetime.now().isoformat(),
            "provider": "groq"
        }
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON response from AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating resume: {str(e)}")

@app.post("/api/generate-cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate AI-personalized cover letter"""
    try:
        prompt = get_cover_letter_prompt(
            request.profile,
            request.company_name,
            request.job_title,
            request.job_description
        )
        
        # Generate content using Groq
        response_text = generate_with_groq(prompt, temperature=0.7, max_tokens=2048)
        
        content = response_text.strip()
        if content.startswith('```json'):
            content = content[7:]
        elif content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        
        letter_data = json.loads(content)
        
        return {
            "status": "success",
            "cover_letter": letter_data,
            "timestamp": datetime.now().isoformat(),
            "provider": "groq"
        }
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON response from AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")

@app.post("/api/generate-portfolio")
async def generate_portfolio(request: PortfolioRequest):
    """Generate portfolio content"""
    try:
        prompt = get_portfolio_prompt(request.profile)
        
        # Generate content using Groq
        response_text = generate_with_groq(prompt, temperature=0.7, max_tokens=4096)
        
        content = response_text.strip()
        if content.startswith('```json'):
            content = content[7:]
        elif content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        
        portfolio_data = json.loads(content)
        
        return {
            "status": "success",
            "portfolio": portfolio_data,
            "timestamp": datetime.now().isoformat(),
            "provider": "groq"
        }
    
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON response from AI: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating portfolio: {str(e)}")

# ==================== PROFILE ENDPOINTS ====================

@app.post("/api/save-profile")
async def save_profile(profile: StudentProfile):
    """Save student profile to file"""
    try:
        filename = f"profile_{profile.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = f"saved_profiles/{filename}"
        
        Path("saved_profiles").mkdir(exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(profile.dict(), f, indent=2)
        
        return {
            "status": "success",
            "message": "Profile saved successfully",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving profile: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "AI Resume Builder",
        "provider": "groq",
        "model": "llama3-70b-8192"
    }

# ==================== RUN SERVER ====================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)