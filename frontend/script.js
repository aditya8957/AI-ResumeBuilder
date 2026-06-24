// ============ CONFIG ============
const API_BASE_URL = 'https://ai-resumebuilder-8w1g.onrender.com';

// ============ STATE MANAGEMENT ============
const appState = {
    skills: [],
    certifications: [],
    education: [],
    experience: [],
    projects: [],
    profile: null
};

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Resume Builder Loaded');
    setupEventListeners();
});

function setupEventListeners() {
    // Allow Enter key in skill/cert inputs
    document.getElementById('skillInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    document.getElementById('certInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCertification();
        }
    });
}

// ============ SKILLS MANAGEMENT ============
function addSkill() {
    const input = document.getElementById('skillInput');
    const skill = input.value.trim();

    if (!skill) {
        showToast('Please enter a skill', 'warning');
        return;
    }

    if (appState.skills.includes(skill)) {
        showToast('Skill already added', 'warning');
        return;
    }

    appState.skills.push(skill);
    input.value = '';
    renderSkills();
    showToast('Skill added!', 'success');
}

function removeSkill(skill) {
    appState.skills = appState.skills.filter(s => s !== skill);
    renderSkills();
}

function renderSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = appState.skills.map(skill => `
        <div class="skill-tag">
            <span>${skill}</span>
            <button onclick="removeSkill('${skill}')">×</button>
        </div>
    `).join('');
}

// ============ CERTIFICATIONS MANAGEMENT ============
function addCertification() {
    const input = document.getElementById('certInput');
    const cert = input.value.trim();

    if (!cert) {
        showToast('Please enter a certification', 'warning');
        return;
    }

    if (appState.certifications.includes(cert)) {
        showToast('Certification already added', 'warning');
        return;
    }

    appState.certifications.push(cert);
    input.value = '';
    renderCertifications();
    showToast('Certification added!', 'success');
}

function removeCertification(cert) {
    appState.certifications = appState.certifications.filter(c => c !== cert);
    renderCertifications();
}

function renderCertifications() {
    const container = document.getElementById('certificationsList');
    container.innerHTML = appState.certifications.map(cert => `
        <div class="skill-tag">
            <span>${cert}</span>
            <button onclick="removeCertification('${cert}')">×</button>
        </div>
    `).join('');
}

// ============ EDUCATION MANAGEMENT ============
function addEducation() {
    const id = Date.now();
    const html = `
        <div class="item-card" id="education-${id}">
            <button class="remove-btn" onclick="removeEducation(${id})">Remove</button>
            <h4>Education #${appState.education.length + 1}</h4>
            <div class="form-grid">
                <input type="text" placeholder="School/University" class="edu-school form-input" required>
                <input type="text" placeholder="Degree (e.g., B.Tech)" class="edu-degree form-input" required>
                <input type="text" placeholder="Field of Study" class="edu-field form-input" required>
                <input type="number" placeholder="Graduation Year" class="edu-year form-input" required>
                <input type="number" placeholder="GPA (Optional)" class="edu-gpa form-input" step="0.01" min="0" max="4">
            </div>
        </div>
    `;
    document.getElementById('educationList').insertAdjacentHTML('beforeend', html);
}

function removeEducation(id) {
    document.getElementById(`education-${id}`).remove();
}

function getEducationData() {
    const cards = document.querySelectorAll('#educationList .item-card');
    return Array.from(cards).map(card => ({
        school: card.querySelector('.edu-school').value,
        degree: card.querySelector('.edu-degree').value,
        field: card.querySelector('.edu-field').value,
        graduation_year: parseInt(card.querySelector('.edu-year').value),
        gpa: card.querySelector('.edu-gpa').value ? parseFloat(card.querySelector('.edu-gpa').value) : null
    }));
}

// ============ EXPERIENCE MANAGEMENT ============
function addExperience() {
    const id = Date.now();
    const html = `
        <div class="item-card" id="experience-${id}">
            <button class="remove-btn" onclick="removeExperience(${id})">Remove</button>
            <h4>Experience #${appState.experience.length + 1}</h4>
            <div class="form-grid">
                <input type="text" placeholder="Company Name" class="exp-company form-input" required>
                <input type="text" placeholder="Job Position" class="exp-position form-input" required>
                <input type="text" placeholder="Duration (e.g., Jan 2022 - Dec 2023)" class="exp-duration form-input" required>
            </div>
            <textarea placeholder="Job Description & Achievements" class="exp-description form-textarea"></textarea>
            <input type="text" placeholder="Skills Used (comma-separated)" class="exp-skills form-input">
        </div>
    `;
    document.getElementById('experienceList').insertAdjacentHTML('beforeend', html);
}

function removeExperience(id) {
    document.getElementById(`experience-${id}`).remove();
}

function getExperienceData() {
    const cards = document.querySelectorAll('#experienceList .item-card');
    return Array.from(cards).map(card => ({
        company: card.querySelector('.exp-company').value,
        position: card.querySelector('.exp-position').value,
        duration: card.querySelector('.exp-duration').value,
        description: card.querySelector('.exp-description').value,
        skills_used: card.querySelector('.exp-skills').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
    }));
}

// ============ PROJECTS MANAGEMENT ============
function addProject() {
    const id = Date.now();
    const html = `
        <div class="item-card" id="project-${id}">
            <button class="remove-btn" onclick="removeProject(${id})">Remove</button>
            <h4>Project #${appState.projects.length + 1}</h4>
            <div class="form-grid">
                <input type="text" placeholder="Project Title" class="proj-title form-input" required>
                <input type="text" placeholder="Project Link (Optional)" class="proj-link form-input">
                <input type="text" placeholder="Date (e.g., Mar 2024)" class="proj-date form-input" required>
            </div>
            <textarea placeholder="Project Description" class="proj-description form-textarea"></textarea>
            <input type="text" placeholder="Technologies Used (comma-separated)" class="proj-tech form-input">
        </div>
    `;
    document.getElementById('projectsList').insertAdjacentHTML('beforeend', html);
}

function removeProject(id) {
    document.getElementById(`project-${id}`).remove();
}

function getProjectsData() {
    const cards = document.querySelectorAll('#projectsList .item-card');
    return Array.from(cards).map(card => ({
        title: card.querySelector('.proj-title').value,
        description: card.querySelector('.proj-description').value,
        technologies: card.querySelector('.proj-tech').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t),
        link: card.querySelector('.proj-link').value || null,
        date: card.querySelector('.proj-date').value
    }));
}

// ============ PROFILE MANAGEMENT ============
function validateProfileForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();

    if (!name || !email || !phone || !location) {
        showToast('Please fill in all required fields (Name, Email, Phone, Location)', 'error');
        return false;
    }

    if (!email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return false;
    }

    if (appState.skills.length === 0) {
        showToast('Please add at least one skill', 'error');
        return false;
    }

    return true;
}

function getProfileData() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        summary: document.getElementById('summary').value || null,
        skills: appState.skills,
        education: getEducationData(),
        experience: getExperienceData(),
        projects: getProjectsData(),
        certifications: appState.certifications,
        github: document.getElementById('github').value || null,
        linkedin: document.getElementById('linkedin').value || null,
        portfolio_website: document.getElementById('portfolio_website').value || null
    };
}

async function saveProfile() {
    if (!validateProfileForm()) {
        return;
    }

    const profile = getProfileData();
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/save-profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });

        if (!response.ok) throw new Error('Failed to save profile');
        
        appState.profile = profile;
        showToast('✅ Profile saved successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function clearForm() {
    if (confirm('Are you sure you want to clear all data?')) {
        document.getElementById('profileForm').reset();
        appState.skills = [];
        appState.certifications = [];
        appState.education = [];
        appState.experience = [];
        appState.projects = [];
        renderSkills();
        renderCertifications();
        document.getElementById('educationList').innerHTML = '';
        document.getElementById('experienceList').innerHTML = '';
        document.getElementById('projectsList').innerHTML = '';
        showToast('Form cleared!', 'success');
    }
}

// ============ RESUME GENERATION ============
async function generateResume() {
    if (!validateProfileForm()) {
        return;
    }

    const profile = getProfileData();
    const jobTitle = document.getElementById('jobTitle').value || null;
    const resumeStyle = document.getElementById('resumeStyle').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/generate-resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile,
                template_style: resumeStyle,
                job_title: jobTitle
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate resume');
        }

        const data = await response.json();
        displayResume(data.resume, profile);
        showToast('✅ Resume generated successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayResume(resume, profile) {
    const container = document.getElementById('resumeOutput');
    
    let html = `
        <div class="document-preview">
            <div class="document-header">
                <h2>${profile.name}</h2>
                <p>${profile.email} | ${profile.phone} | ${profile.location}</p>
                ${profile.github ? `<p><a href="${profile.github}" target="_blank">GitHub</a>` : ''}
                ${profile.linkedin ? `| <a href="${profile.linkedin}" target="_blank">LinkedIn</a></p>` : '</p>'}
            </div>
    `;

    if (resume.professional_summary) {
        html += `
            <div class="document-section">
                <h3>Professional Summary</h3>
                <div class="document-item-content">${resume.professional_summary}</div>
            </div>
        `;
    }

    if (resume.experience && resume.experience.length > 0) {
        html += `<div class="document-section"><h3>Experience</h3>`;
        resume.experience.forEach(exp => {
            html += `
                <div class="document-item">
                    <div class="document-item-title">${exp.position}</div>
                    <div class="document-item-subtitle">${exp.company} | ${exp.duration}</div>
                    <div class="document-item-content">${exp.description}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (resume.education && resume.education.length > 0) {
        html += `<div class="document-section"><h3>Education</h3>`;
        resume.education.forEach(edu => {
            html += `
                <div class="document-item">
                    <div class="document-item-title">${edu.degree} in ${edu.field}</div>
                    <div class="document-item-subtitle">${edu.school} | ${edu.graduation_year}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    if (resume.skills && resume.skills.length > 0) {
        html += `
            <div class="document-section">
                <h3>Skills</h3>
                <div class="skills-list">
                    ${resume.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
                </div>
            </div>
        `;
    }

    if (resume.projects && resume.projects.length > 0) {
        html += `<div class="document-section"><h3>Projects</h3>`;
        resume.projects.forEach(proj => {
            html += `
                <div class="document-item">
                    <div class="document-item-title">${proj.title}</div>
                    <div class="document-item-subtitle">${proj.date}</div>
                    <div class="document-item-content">${proj.description}</div>
                </div>
            `;
        });
        html += `</div>`;
    }

    html += `
        </div>
        <div style="text-align: center; margin-top: 20px; gap: 10px; display: flex; justify-content: center;">
            <button class="btn btn-primary" onclick="printDocument()">🖨️ Print Resume</button>
            <button class="btn btn-secondary" onclick="downloadAsJSON('resume')">📥 Download JSON</button>
        </div>
    `;

    container.innerHTML = html;
}

// ============ COVER LETTER GENERATION ============
async function generateCoverLetter() {
    if (!validateProfileForm()) {
        return;
    }

    const companyName = document.getElementById('companyName').value.trim();
    const jobTitle = document.getElementById('coverJobTitle').value.trim();
    const jobDescription = document.getElementById('jobDescription').value.trim() || null;

    if (!companyName || !jobTitle) {
        showToast('Please enter Company Name and Job Title', 'error');
        return;
    }

    const profile = getProfileData();

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/generate-cover-letter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile,
                company_name: companyName,
                job_title: jobTitle,
                job_description: jobDescription
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate cover letter');
        }

        const data = await response.json();
        displayCoverLetter(data.cover_letter, profile, companyName, jobTitle);
        showToast('✅ Cover letter generated successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayCoverLetter(letter, profile, company, jobTitle) {
    const container = document.getElementById('coverLetterOutput');
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    let html = `
        <div class="document-preview">
            <div style="text-align: right; margin-bottom: 20px;">
                <p>${today}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p><strong>${company}</strong></p>
                <p>Hiring Team</p>
            </div>

            <div style="margin-bottom: 20px;">
                <p><strong>Dear Hiring Manager,</strong></p>
            </div>

            <div style="margin-bottom: 20px; line-height: 1.8;">
                <p>${letter.opening}</p>
            </div>

            <div style="margin-bottom: 20px; line-height: 1.8;">
                <p>${letter.body_paragraph_1}</p>
            </div>

            <div style="margin-bottom: 20px; line-height: 1.8;">
                <p>${letter.body_paragraph_2}</p>
            </div>

            <div style="margin-bottom: 20px; line-height: 1.8;">
                <p>${letter.closing}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <p><strong>Sincerely,</strong></p>
                <p style="margin-top: 30px;">${profile.name}</p>
                <p>${profile.email}</p>
                <p>${profile.phone}</p>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
            <button class="btn btn-primary" onclick="printDocument()">🖨️ Print Letter</button>
            <button class="btn btn-secondary" onclick="downloadAsJSON('cover-letter')">📥 Download JSON</button>
        </div>
    `;

    container.innerHTML = html;
}

// ============ PORTFOLIO GENERATION ============
async function generatePortfolio() {
    if (!validateProfileForm()) {
        return;
    }

    const profile = getProfileData();
    const themeColor = document.getElementById('themeColor').value;

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/generate-portfolio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile,
                theme_color: themeColor
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate portfolio');
        }

        const data = await response.json();
        displayPortfolio(data.portfolio, profile);
        showToast('✅ Portfolio content generated successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayPortfolio(portfolio, profile) {
    const container = document.getElementById('portfolioOutput');

    let html = `
        <div class="document-preview">
            <div class="document-header">
                <h2>${profile.name}</h2>
                <p style="font-size: 16px;">${portfolio.hero_section?.tagline || 'Full Stack Developer'}</p>
            </div>

            <div class="document-section">
                <h3>About Me</h3>
                <p>${portfolio.about_section}</p>
            </div>

            <div class="document-section">
                <h3>Featured Projects</h3>
    `;

    if (portfolio.featured_projects && portfolio.featured_projects.length > 0) {
        portfolio.featured_projects.forEach(proj => {
            html += `
                <div class="document-item">
                    <div class="document-item-title">${proj.title}</div>
                    <div class="document-item-content">${proj.description}</div>
                </div>
            `;
        });
    }

    html += `</div>`;

    if (portfolio.testimonial_suggestions) {
        html += `
            <div class="document-section">
                <h3>Testimonials</h3>
                <p><strong>Types of testimonials to gather:</strong></p>
                <p>${portfolio.testimonial_suggestions}</p>
            </div>
        `;
    }

    if (portfolio.call_to_action) {
        html += `
            <div class="document-section">
                <h3>Let's Work Together</h3>
                <p>${portfolio.call_to_action}</p>
            </div>
        `;
    }

    html += `
        </div>
        <div style="text-align: center; margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
            <button class="btn btn-primary" onclick="printDocument()">🖨️ Print Portfolio</button>
            <button class="btn btn-secondary" onclick="downloadAsJSON('portfolio')">📥 Download JSON</button>
        </div>
    `;

    container.innerHTML = html;
}

// ============ UTILITIES ============
function scrollToProfile() {
    document.getElementById('profile-section').scrollIntoView({ behavior: 'smooth' });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function printDocument() {
    window.print();
}

function downloadAsJSON(type) {
    const output = document.querySelector(`#${type === 'resume' ? 'resume' : type === 'cover-letter' ? 'coverLetter' : 'portfolio'}Output`);
    if (!output.innerHTML) {
        showToast('Please generate content first', 'warning');
        return;
    }

    // Extract text content
    const element = output.querySelector('.document-preview');
    if (!element) {
        showToast('No content to download', 'error');
        return;
    }

    const dataStr = element.innerText;
    const dataBlob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast(`${type} downloaded!`, 'success');
}