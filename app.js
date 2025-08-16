/**
 * ATS-Friendly Resume Builder
 * A vanilla JavaScript application that builds professional, ATS-friendly resumes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Global state to store resume data
    const resumeData = {
        profile: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            photo: '',
            links: []
        },
        summary: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: []
    };
    
    // DOM Elements
    const formPanel = document.getElementById('formPanel');
    const previewPanel = document.getElementById('previewPanel');
    const previewToggle = document.getElementById('previewToggle');
    
    // Template selectors
    const templateSelector = document.getElementById('templateSelector');
    const linkTemplate = document.getElementById('linkTemplate');
    const experienceTemplate = document.getElementById('experienceTemplate');
    const bulletTemplate = document.getElementById('bulletTemplate');
    const educationTemplate = document.getElementById('educationTemplate');
    const projectTemplate = document.getElementById('projectTemplate');
    const certificationTemplate = document.getElementById('certificationTemplate');
    const languageTemplate = document.getElementById('languageTemplate');
    
    // Action buttons
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const exportBtn = document.getElementById('exportBtn');
    const exportDocxBtn = document.getElementById('exportDocxBtn');
    const printBtn = document.getElementById('printBtn');
    
    // Section-specific form elements
    const profileName = document.getElementById('profileName');
    const profileTitle = document.getElementById('profileTitle');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileLocation = document.getElementById('profileLocation');
    const includePhoto = document.getElementById('includePhoto');
    const photoUpload = document.getElementById('photoUpload');
    const profileLinks = document.getElementById('profileLinks');
    const addLinkBtn = document.getElementById('addLinkBtn');
    
    const summary = document.getElementById('summary');
    const summaryCount = document.getElementById('summaryCount');
    
    const skillInput = document.getElementById('skillInput');
    const skillTags = document.getElementById('skillTags');
    const addSkillBtn = document.getElementById('addSkillBtn');
    
    const experienceItems = document.getElementById('experienceItems');
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    
    const educationItems = document.getElementById('educationItems');
    const addEducationBtn = document.getElementById('addEducationBtn');
    
    const projectItems = document.getElementById('projectItems');
    const addProjectBtn = document.getElementById('addProjectBtn');
    
    const certificationItems = document.getElementById('certificationItems');
    const addCertificationBtn = document.getElementById('addCertificationBtn');
    
    const languageItems = document.getElementById('languageItems');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    
    // Set resume date
    document.getElementById('resumeDate').textContent = formatDate(new Date());
    
    // Event Listeners for basic actions
    previewToggle.addEventListener('click', togglePreview);
    templateSelector.addEventListener('change', changeTemplate);
    saveBtn.addEventListener('click', saveResume);
    loadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadResumeFromFile);
    exportBtn.addEventListener('click', exportAsText);
    exportDocxBtn.addEventListener('click', exportAsDocx);
    printBtn.addEventListener('click', printResume);
    
    // Initialize the application
    initApp();
    
    /**
     * Initialize the application
     */
    function initApp() {
        // Initialize the accordion
        setupAccordion();
        
        // Set up event listeners for form sections
        setupProfileSection();
        setupSummarySection();
        setupSkillsSection();
        setupRepeatableSections();
        
        // Initialize with sample data or saved data
        initializeSampleData();
        
        // Set up debounced preview update
        window.addEventListener('resize', debounce(adjustPreviewScale, 250));
        adjustPreviewScale();
    }
    
    /**
     * Set up the accordion functionality
     */
    function setupAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isOpen = item.classList.contains('open');
                
                // Close all accordion items
                document.querySelectorAll('.accordion-item').forEach(accordionItem => {
                    accordionItem.classList.remove('open');
                    const icon = accordionItem.querySelector('.toggle-icon');
                    if (icon) icon.textContent = '▶';
                });
                
                // Open the clicked item if it was closed
                if (!isOpen) {
                    item.classList.add('open');
                    const icon = item.querySelector('.toggle-icon');
                    if (icon) icon.textContent = '▼';
                }
            });
        });
    }
    
    /**
     * Toggle between form and preview on mobile
     */
    function togglePreview() {
        if (previewPanel.classList.contains('active')) {
            previewPanel.classList.remove('active');
            previewToggle.textContent = 'Preview';
        } else {
            previewPanel.classList.add('active');
            previewToggle.textContent = 'Edit';
            updatePreview(); // Ensure preview is updated
            adjustPreviewScale();
        }
    }
    
    /**
     * Change the resume template
     */
    function changeTemplate() {
        const templateName = templateSelector.value;
        previewPanel.className = `preview-panel ${templateName}`;
        updatePreview();
    }
    
    /**
     * Save resume data
     */
    function saveResume() {
        // Update global data from form
        collectFormData();
        
        // Save to localStorage
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        
        // Create downloadable file
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "resume-data.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        
        showNotification('Resume saved successfully!');
    }
    
    /**
     * Load resume data from a JSON file
     */
    function loadResumeFromFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    Object.assign(resumeData, loadedData);
                    populateFormFromData();
                    updatePreview();
                    showNotification('Resume loaded successfully!');
                } catch (error) {
                    showNotification('Error loading resume data: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        }
    }
    
    /**
     * Export resume as plain text for ATS systems
     */
    function exportAsText() {
        // Update global data from form
        collectFormData();
        
        // Generate plain text version
        let textContent = `${resumeData.profile.name}\n`;
        textContent += `${resumeData.profile.title}\n`;
        textContent += `${resumeData.profile.email} | ${resumeData.profile.phone} | ${resumeData.profile.location}\n\n`;
        
        if (resumeData.profile.links.length > 0) {
            resumeData.profile.links.forEach(link => {
                textContent += `${link.label}: ${link.url}\n`;
            });
            textContent += '\n';
        }
        
        textContent += `SUMMARY\n${resumeData.summary}\n\n`;
        
        if (resumeData.skills.length > 0) {
            textContent += `SKILLS\n${resumeData.skills.join(', ')}\n\n`;
        }
        
        if (resumeData.experience.length > 0) {
            textContent += `EXPERIENCE\n`;
            resumeData.experience.forEach(exp => {
                textContent += `${exp.role}\n${exp.company}, ${exp.location}\n${exp.start} to ${exp.end}\n`;
                exp.bullets.forEach(bullet => {
                    textContent += `• ${bullet}\n`;
                });
                textContent += '\n';
            });
        }
        
        if (resumeData.education.length > 0) {
            textContent += `EDUCATION\n`;
            resumeData.education.forEach(edu => {
                textContent += `${edu.degree}\n${edu.school}, ${edu.location}\n${edu.start} to ${edu.end}\n`;
                if (edu.details) textContent += `${edu.details}\n`;
                textContent += '\n';
            });
        }
        
        if (resumeData.projects.length > 0) {
            textContent += `PROJECTS\n`;
            resumeData.projects.forEach(project => {
                textContent += `${project.name}\n`;
                if (project.link) textContent += `${project.link}\n`;
                if (project.tech.length > 0) textContent += `Technologies: ${project.tech.join(', ')}\n`;
                project.bullets.forEach(bullet => {
                    textContent += `• ${bullet}\n`;
                });
                textContent += '\n';
            });
        }
        
        if (resumeData.certifications.length > 0) {
            textContent += `CERTIFICATIONS\n`;
            resumeData.certifications.forEach(cert => {
                textContent += `${cert.name}, ${cert.issuer}, ${cert.year}\n`;
            });
            textContent += '\n';
        }
        
        if (resumeData.languages.length > 0) {
            textContent += `LANGUAGES\n`;
            resumeData.languages.forEach(lang => {
                textContent += `${lang.language} - ${lang.proficiency}\n`;
            });
        }
        
        // Create downloadable file
        const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${resumeData.profile.name.replace(/\s+/g, '_') || 'Resume'}.txt`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
        
        showNotification('Resume exported as text successfully!');
    }
    
    /**
     * Print the resume to PDF
     */
    function printResume() {
        // Force the preview to be visible during print
        const wasHidden = !previewPanel.classList.contains('active');
        if (wasHidden) {
            previewPanel.classList.add('active');
        }
        
        // Update global data
        collectFormData();
        updatePreview();
        
        // Save the original title
        const originalTitle = document.title;
        
        // Temporarily change the title for the PDF filename
        document.title = `${resumeData.profile.name ? resumeData.profile.name + ' - Resume' : 'Resume'}`;
        
        // Use timeout to ensure preview is fully rendered
        setTimeout(() => {
            window.print();
            
            // Reset title after printing
            setTimeout(() => {
                document.title = originalTitle;
                
                // Hide preview again if it was hidden before
                if (wasHidden) {
                    previewPanel.classList.remove('active');
                }
                
                showNotification('Resume printed successfully!');
            }, 100);
        }, 200);
    }
    
    /**
     * Export resume as DOCX file
     */
    function exportAsDocx() {
        // Update global data from form
        collectFormData();
        
        try {
            // Use docx library to create Word document
            const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
            
            // Set theme-specific colors
            const themeColor = templateSelector.value === "modern" ? "333333" : "2A60C8";
            
            // Create document
            const doc = new Document({
                styles: {
                    paragraphStyles: [
                        {
                            id: "Normal",
                            name: "Normal",
                            run: {
                                font: "Calibri",
                                size: 22, // 11pt
                            },
                            paragraph: {
                                spacing: {
                                    line: 276, // 1.15 line spacing
                                },
                            },
                        },
                        {
                            id: "Heading1",
                            name: "Heading 1",
                            run: {
                                font: "Calibri",
                                size: 32, // 16pt
                                bold: true,
                                color: themeColor,
                            },
                            paragraph: {
                                spacing: {
                                    before: 240, // 12pt
                                    after: 120, // 6pt
                                },
                            },
                        },
                        {
                            id: "Heading2",
                            name: "Heading 2",
                            run: {
                                font: "Calibri",
                                size: 26, // 13pt
                                bold: true,
                                color: themeColor,
                            },
                            paragraph: {
                                spacing: {
                                    before: 240, // 12pt
                                    after: 120, // 6pt
                                },
                                border: {
                                    bottom: {
                                        color: "999999",
                                        style: BorderStyle.SINGLE,
                                        size: 1,
                                    },
                                },
                            },
                        },
                    ],
                },
            });

            // Create sections
            const children = [];
            
            // Header section (name & contact)
            children.push(
                new Paragraph({
                    text: resumeData.profile.name || "Your Name",
                    heading: HeadingLevel.HEADING_1,
                    alignment: templateSelector.value === "modern" ? AlignmentType.CENTER : AlignmentType.LEFT,
                })
            );
            
            children.push(
                new Paragraph({
                    alignment: templateSelector.value === "modern" ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: resumeData.profile.title || "Professional Title",
                            bold: true,
                            size: 24, // 12pt
                        }),
                    ],
                    spacing: {
                        after: templateSelector.value === "modern" ? 120 : 80,
                    }
                })
            );

            // Contact info
            const contactInfo = [];
            if (resumeData.profile.email) contactInfo.push(resumeData.profile.email);
            if (resumeData.profile.phone) contactInfo.push(resumeData.profile.phone);
            if (resumeData.profile.location) contactInfo.push(resumeData.profile.location);
            
            children.push(
                new Paragraph({
                    alignment: templateSelector.value === "modern" ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: contactInfo.join(" • "),
                            size: 20, // 10pt
                        }),
                    ],
                    spacing: {
                        after: 80,
                    },
                })
            );
            
            // Links
            if (resumeData.profile.links && resumeData.profile.links.length > 0) {
                const linkTexts = resumeData.profile.links.map(link => `${link.label}: ${link.url}`);
                
                children.push(
                    new Paragraph({
                        alignment: templateSelector.value === "modern" ? AlignmentType.CENTER : AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: linkTexts.join(" | "),
                                size: 20, // 10pt
                                color: "0563C1",
                                underline: {
                                    type: "single",
                                },
                            }),
                        ],
                        spacing: {
                            after: 160,
                        },
                    })
                );
            }
            
            // Summary section
            if (resumeData.summary) {
                children.push(
                    new Paragraph({
                        text: "SUMMARY",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                children.push(
                    new Paragraph({
                        text: resumeData.summary,
                        spacing: {
                            after: 160,
                        },
                    })
                );
            }
            
            // Skills section
            if (resumeData.skills && resumeData.skills.length > 0) {
                children.push(
                    new Paragraph({
                        text: "SKILLS",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                children.push(
                    new Paragraph({
                        text: resumeData.skills.join(", "),
                        spacing: {
                            after: 160,
                        },
                    })
                );
            }
            
            // Experience section
            if (resumeData.experience && resumeData.experience.length > 0) {
                children.push(
                    new Paragraph({
                        text: "EXPERIENCE",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                resumeData.experience.forEach(exp => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: exp.role,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: {
                                before: 120,
                            },
                        })
                    );
                    
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${exp.company}${exp.location ? ", " + exp.location : ""}`,
                                    italics: true,
                                }),
                            ],
                        })
                    );
                    
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${exp.start || ""} to ${exp.end || "Present"}`,
                                    size: 20, // 10pt
                                    color: "666666",
                                }),
                            ],
                            spacing: {
                                after: 80,
                            },
                        })
                    );
                    
                    // Add bullet points
                    if (exp.bullets && exp.bullets.length > 0) {
                        exp.bullets.forEach(bullet => {
                            if (bullet.trim()) {
                                children.push(
                                    new Paragraph({
                                        text: bullet,
                                        bullet: {
                                            level: 0,
                                        },
                                        spacing: {
                                            before: 20,
                                            after: 20,
                                        },
                                    })
                                );
                            }
                        });
                    }
                });
            }
            
            // Education section
            if (resumeData.education && resumeData.education.length > 0) {
                children.push(
                    new Paragraph({
                        text: "EDUCATION",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                resumeData.education.forEach(edu => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.degree,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: {
                                before: 120,
                            },
                        })
                    );
                    
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${edu.school}${edu.location ? ", " + edu.location : ""}`,
                                    italics: true,
                                }),
                            ],
                        })
                    );
                    
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${edu.start || ""} to ${edu.end || ""}`,
                                    size: 20, // 10pt
                                    color: "666666",
                                }),
                            ],
                        })
                    );
                    
                    if (edu.details) {
                        children.push(
                            new Paragraph({
                                text: edu.details,
                                spacing: {
                                    after: 80,
                                },
                            })
                        );
                    }
                });
            }
            
            // Projects section
            if (resumeData.projects && resumeData.projects.length > 0) {
                children.push(
                    new Paragraph({
                        text: "PROJECTS",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                resumeData.projects.forEach(project => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: project.name,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                            ],
                            spacing: {
                                before: 120,
                            },
                        })
                    );
                    
                    if (project.tech && project.tech.length > 0) {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Technologies: ${project.tech.join(", ")}`,
                                        italics: true,
                                        size: 20, // 10pt
                                    }),
                                ],
                            })
                        );
                    }
                    
                    if (project.link) {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: project.link,
                                        size: 20, // 10pt
                                        color: "0563C1",
                                        underline: {
                                            type: "single",
                                        },
                                    }),
                                ],
                                spacing: {
                                    after: 80,
                                },
                            })
                        );
                    }
                    
                    // Add bullet points
                    if (project.bullets && project.bullets.length > 0) {
                        project.bullets.forEach(bullet => {
                            if (bullet.trim()) {
                                children.push(
                                    new Paragraph({
                                        text: bullet,
                                        bullet: {
                                            level: 0,
                                        },
                                        spacing: {
                                            before: 20,
                                            after: 20,
                                        },
                                    })
                                );
                            }
                        });
                    }
                });
            }
            
            // Certifications section
            if (resumeData.certifications && resumeData.certifications.length > 0) {
                children.push(
                    new Paragraph({
                        text: "CERTIFICATIONS",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                resumeData.certifications.forEach(cert => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: cert.name,
                                    bold: true,
                                }),
                                new TextRun({
                                    text: cert.issuer ? `, ${cert.issuer}` : "",
                                }),
                                new TextRun({
                                    text: cert.year ? ` (${cert.year})` : "",
                                }),
                            ],
                            spacing: {
                                before: 80,
                                after: 40,
                            },
                        })
                    );
                });
            }
            
            // Languages section
            if (resumeData.languages && resumeData.languages.length > 0) {
                children.push(
                    new Paragraph({
                        text: "LANGUAGES",
                        heading: HeadingLevel.HEADING_2,
                    })
                );
                
                resumeData.languages.forEach(lang => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: lang.language,
                                    bold: true,
                                }),
                                new TextRun({
                                    text: ` - ${lang.proficiency}`,
                                }),
                            ],
                            spacing: {
                                before: 80,
                                after: 40,
                            },
                        })
                    );
                });
            }
            
            // Add all sections to document with proper margins
            doc.addSection({
                children: children,
                margins: {
                    top: 720,   // 0.5 inch (1440 = 1 inch)
                    right: 720, // 0.5 inch
                    bottom: 720, // 0.5 inch
                    left: 720, // 0.5 inch
                },
            });

            // Generate document
            docx.Packer.toBlob(doc).then(blob => {
                // Create a download link
                const url = window.URL.createObjectURL(blob);
                const filename = (resumeData.profile.name ? 
                    resumeData.profile.name.replace(/\s+/g, '_') + '_Resume.docx' : 
                    'Resume.docx');
                    
                const downloadLink = document.createElement('a');
                document.body.appendChild(downloadLink);
                downloadLink.href = url;
                downloadLink.download = filename;
                downloadLink.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(downloadLink);
                
                showNotification('Resume exported as DOCX successfully!');
            });
        } catch (error) {
            showNotification('Error exporting DOCX: ' + error.message, 'error');
            console.error('DOCX export error:', error);
        }
    }
    
    /**
     * Set up event listeners for profile section
     */
    function setupProfileSection() {
        // Basic profile fields
        profileName.addEventListener('input', updateProfilePreview);
        profileTitle.addEventListener('input', updateProfilePreview);
        profileEmail.addEventListener('input', updateProfilePreview);
        profilePhone.addEventListener('input', updateProfilePreview);
        profileLocation.addEventListener('input', updateProfilePreview);
        
        // Photo upload
        includePhoto.addEventListener('change', function() {
            photoUpload.disabled = !this.checked;
            if (!this.checked) {
                document.getElementById('previewPhotoContainer').style.display = 'none';
                resumeData.profile.photo = '';
            }
        });
        
        photoUpload.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewPhoto = document.getElementById('previewPhoto');
                    previewPhoto.src = e.target.result;
                    document.getElementById('previewPhotoContainer').style.display = 'block';
                    resumeData.profile.photo = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
        
        // Links
        addLinkBtn.addEventListener('click', function() {
            const linkItem = linkTemplate.content.cloneNode(true);
            setupLinkItem(linkItem);
            profileLinks.appendChild(linkItem);
            updateLinksPreview();
        });
    }
    
    /**
     * Set up event listeners for a link item
     */
    function setupLinkItem(linkItem) {
        const removeBtn = linkItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function() {
            this.closest('.link-item').remove();
            updateLinksPreview();
        });
        
        const inputs = linkItem.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', updateLinksPreview);
        });
    }
    
    /**
     * Set up event listeners for summary section
     */
    function setupSummarySection() {
        summary.addEventListener('input', function() {
            summaryCount.textContent = this.value.length;
            document.getElementById('previewSummary').textContent = this.value;
        });
    }
    
    /**
     * Set up event listeners for skills section
     */
    function setupSkillsSection() {
        // Add skill
        addSkillBtn.addEventListener('click', function() {
            addSkill();
        });
        
        // Allow enter key to add skill
        skillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
        
        function addSkill() {
            const skill = skillInput.value.trim();
            if (skill) {
                if (!resumeData.skills.includes(skill)) {
                    resumeData.skills.push(skill);
                    renderSkillTags();
                    updateSkillsPreview();
                }
                skillInput.value = '';
            }
        }
        
        function renderSkillTags() {
            skillTags.innerHTML = '';
            resumeData.skills.forEach((skill, index) => {
                const tag = document.createElement('div');
                tag.className = 'skill-tag';
                tag.innerHTML = `${skill} <span>×</span>`;
                
                const removeBtn = tag.querySelector('span');
                removeBtn.addEventListener('click', function() {
                    resumeData.skills.splice(index, 1);
                    renderSkillTags();
                    updateSkillsPreview();
                });
                
                skillTags.appendChild(tag);
            });
        }
    }
    
    /**
     * Set up event listeners for sections with repeatable items
     */
    function setupRepeatableSections() {
        // Experience section
        addExperienceBtn.addEventListener('click', function() {
            addExperienceItem();
        });
        
        // Education section
        addEducationBtn.addEventListener('click', function() {
            addEducationItem();
        });
        
        // Project section
        addProjectBtn.addEventListener('click', function() {
            addProjectItem();
        });
        
        // Certification section
        addCertificationBtn.addEventListener('click', function() {
            addCertificationItem();
        });
        
        // Language section
        addLanguageBtn.addEventListener('click', function() {
            addLanguageItem();
        });
    }
    
    /**
     * Add a new experience item to the form
     * @param {Object} data - Optional data to populate the item
     */
    function addExperienceItem(data = null) {
        const expItem = experienceTemplate.content.cloneNode(true);
        const expContainer = expItem.querySelector('.experience-entry');
        const moveUpBtn = expItem.querySelector('.move-up-btn');
        const moveDownBtn = expItem.querySelector('.move-down-btn');
        const removeBtn = expItem.querySelector('.remove-btn');
        const addBulletBtn = expItem.querySelector('.add-bullet-btn');
        const bulletsContainer = expItem.querySelector('.bullets-container');
        
        // Set up move and remove buttons
        moveUpBtn.addEventListener('click', function() {
            const prev = expContainer.previousElementSibling;
            if (prev) {
                experienceItems.insertBefore(expContainer, prev);
                updateExperiencePreview();
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = expContainer.nextElementSibling;
            if (next) {
                experienceItems.insertBefore(next, expContainer);
                updateExperiencePreview();
            }
        });
        
        removeBtn.addEventListener('click', function() {
            expContainer.remove();
            updateExperiencePreview();
        });
        
        // Set up add bullet button
        addBulletBtn.addEventListener('click', function() {
            addBulletPoint(bulletsContainer, updateExperiencePreview);
        });
        
        // If data is provided, populate the fields
        if (data) {
            expItem.querySelector('.role').value = data.role || '';
            expItem.querySelector('.company').value = data.company || '';
            expItem.querySelector('.location').value = data.location || '';
            expItem.querySelector('.start-date').value = data.start || '';
            expItem.querySelector('.end-date').value = data.end || '';
            
            if (data.bullets && data.bullets.length > 0) {
                data.bullets.forEach(bullet => {
                    addBulletPoint(bulletsContainer, updateExperiencePreview, bullet);
                });
            }
        }
        
        // Add event listeners for all form fields
        const formInputs = expItem.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('input', updateExperiencePreview);
        });
        
        experienceItems.appendChild(expItem);
        
        // Add at least one bullet point by default
        if (!data || !data.bullets || data.bullets.length === 0) {
            addBulletBtn.click();
        }
        
        updateExperiencePreview();
    }
    
    /**
     * Add a bullet point to a container
     * @param {Element} container - Container to add the bullet to
     * @param {Function} updateCallback - Function to call when bullet is updated
     * @param {string} value - Optional value to populate the bullet
     */
    function addBulletPoint(container, updateCallback, value = '') {
        const bulletItem = bulletTemplate.content.cloneNode(true);
        const bulletInput = bulletItem.querySelector('.bullet-input');
        const bulletField = bulletItem.querySelector('.bullet');
        const removeBulletBtn = bulletItem.querySelector('.remove-bullet-btn');
        
        bulletField.value = value;
        
        removeBulletBtn.addEventListener('click', function() {
            bulletInput.remove();
            updateCallback();
        });
        
        bulletField.addEventListener('input', updateCallback);
        
        container.appendChild(bulletItem);
        
        if (!value) {
            bulletField.focus();
        }
    }
    
    /**
     * Add a new education item to the form
     * @param {Object} data - Optional data to populate the item
     */
    function addEducationItem(data = null) {
        const eduItem = educationTemplate.content.cloneNode(true);
        const eduContainer = eduItem.querySelector('.education-entry');
        const moveUpBtn = eduItem.querySelector('.move-up-btn');
        const moveDownBtn = eduItem.querySelector('.move-down-btn');
        const removeBtn = eduItem.querySelector('.remove-btn');
        
        // Set up move and remove buttons
        moveUpBtn.addEventListener('click', function() {
            const prev = eduContainer.previousElementSibling;
            if (prev) {
                educationItems.insertBefore(eduContainer, prev);
                updateEducationPreview();
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = eduContainer.nextElementSibling;
            if (next) {
                educationItems.insertBefore(next, eduContainer);
                updateEducationPreview();
            }
        });
        
        removeBtn.addEventListener('click', function() {
            eduContainer.remove();
            updateEducationPreview();
        });
        
        // If data is provided, populate the fields
        if (data) {
            eduItem.querySelector('.degree').value = data.degree || '';
            eduItem.querySelector('.school').value = data.school || '';
            eduItem.querySelector('.location').value = data.location || '';
            eduItem.querySelector('.start-date').value = data.start || '';
            eduItem.querySelector('.end-date').value = data.end || '';
            eduItem.querySelector('.details').value = data.details || '';
        }
        
        // Add event listeners for all form fields
        const formInputs = eduItem.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('input', updateEducationPreview);
        });
        
        educationItems.appendChild(eduItem);
        updateEducationPreview();
    }
    
    /**
     * Add a new project item to the form
     * @param {Object} data - Optional data to populate the item
     */
    function addProjectItem(data = null) {
        const projectItem = projectTemplate.content.cloneNode(true);
        const projectContainer = projectItem.querySelector('.project-entry');
        const moveUpBtn = projectItem.querySelector('.move-up-btn');
        const moveDownBtn = projectItem.querySelector('.move-down-btn');
        const removeBtn = projectItem.querySelector('.remove-btn');
        const addBulletBtn = projectItem.querySelector('.add-bullet-btn');
        const bulletsContainer = projectItem.querySelector('.bullets-container');
        const addTechBtn = projectItem.querySelector('.add-tech-btn');
        const techInput = projectItem.querySelector('.tech-input');
        const techTags = projectItem.querySelector('.tech-tags');
        
        // Set up tech tags
        const projectTech = data && data.tech ? [...data.tech] : [];
        
        function renderTechTags() {
            techTags.innerHTML = '';
            projectTech.forEach((tech, index) => {
                const tag = document.createElement('div');
                tag.className = 'tech-tag';
                tag.innerHTML = `${tech} <span>×</span>`;
                
                const removeBtn = tag.querySelector('span');
                removeBtn.addEventListener('click', function() {
                    projectTech.splice(index, 1);
                    renderTechTags();
                    updateProjectsPreview();
                });
                
                techTags.appendChild(tag);
            });
        }
        
        // Set up add tech button
        addTechBtn.addEventListener('click', function() {
            const tech = techInput.value.trim();
            if (tech) {
                if (!projectTech.includes(tech)) {
                    projectTech.push(tech);
                    renderTechTags();
                    updateProjectsPreview();
                }
                techInput.value = '';
            }
        });
        
        // Allow enter key to add tech
        techInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTechBtn.click();
            }
        });
        
        // Set up move and remove buttons
        moveUpBtn.addEventListener('click', function() {
            const prev = projectContainer.previousElementSibling;
            if (prev) {
                projectItems.insertBefore(projectContainer, prev);
                updateProjectsPreview();
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = projectContainer.nextElementSibling;
            if (next) {
                projectItems.insertBefore(next, projectContainer);
                updateProjectsPreview();
            }
        });
        
        removeBtn.addEventListener('click', function() {
            projectContainer.remove();
            updateProjectsPreview();
        });
        
        // Set up add bullet button
        addBulletBtn.addEventListener('click', function() {
            addBulletPoint(bulletsContainer, updateProjectsPreview);
        });
        
        // If data is provided, populate the fields
        if (data) {
            projectItem.querySelector('.project-name').value = data.name || '';
            projectItem.querySelector('.project-link').value = data.link || '';
            
            if (data.tech && data.tech.length > 0) {
                renderTechTags();
            }
            
            if (data.bullets && data.bullets.length > 0) {
                data.bullets.forEach(bullet => {
                    addBulletPoint(bulletsContainer, updateProjectsPreview, bullet);
                });
            }
        }
        
        // Add event listeners for all form fields
        const formInputs = projectItem.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('input', updateProjectsPreview);
        });
        
        projectItems.appendChild(projectItem);
        
        // Add at least one bullet point by default
        if (!data || !data.bullets || data.bullets.length === 0) {
            addBulletBtn.click();
        }
        
        updateProjectsPreview();
    }
    
    /**
     * Add a new certification item to the form
     * @param {Object} data - Optional data to populate the item
     */
    function addCertificationItem(data = null) {
        const certItem = certificationTemplate.content.cloneNode(true);
        const certContainer = certItem.querySelector('.certification-entry');
        const moveUpBtn = certItem.querySelector('.move-up-btn');
        const moveDownBtn = certItem.querySelector('.move-down-btn');
        const removeBtn = certItem.querySelector('.remove-btn');
        
        // Set up move and remove buttons
        moveUpBtn.addEventListener('click', function() {
            const prev = certContainer.previousElementSibling;
            if (prev) {
                certificationItems.insertBefore(certContainer, prev);
                updateCertificationsPreview();
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = certContainer.nextElementSibling;
            if (next) {
                certificationItems.insertBefore(next, certContainer);
                updateCertificationsPreview();
            }
        });
        
        removeBtn.addEventListener('click', function() {
            certContainer.remove();
            updateCertificationsPreview();
        });
        
        // If data is provided, populate the fields
        if (data) {
            certItem.querySelector('.cert-name').value = data.name || '';
            certItem.querySelector('.cert-issuer').value = data.issuer || '';
            certItem.querySelector('.cert-year').value = data.year || '';
        }
        
        // Add event listeners for all form fields
        const formInputs = certItem.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('input', updateCertificationsPreview);
        });
        
        certificationItems.appendChild(certItem);
        updateCertificationsPreview();
    }
    
    /**
     * Add a new language item to the form
     * @param {Object} data - Optional data to populate the item
     */
    function addLanguageItem(data = null) {
        const langItem = languageTemplate.content.cloneNode(true);
        const langContainer = langItem.querySelector('.language-entry');
        const moveUpBtn = langItem.querySelector('.move-up-btn');
        const moveDownBtn = langItem.querySelector('.move-down-btn');
        const removeBtn = langItem.querySelector('.remove-btn');
        
        // Set up move and remove buttons
        moveUpBtn.addEventListener('click', function() {
            const prev = langContainer.previousElementSibling;
            if (prev) {
                languageItems.insertBefore(langContainer, prev);
                updateLanguagesPreview();
            }
        });
        
        moveDownBtn.addEventListener('click', function() {
            const next = langContainer.nextElementSibling;
            if (next) {
                languageItems.insertBefore(next, langContainer);
                updateLanguagesPreview();
            }
        });
        
        removeBtn.addEventListener('click', function() {
            langContainer.remove();
            updateLanguagesPreview();
        });
        
        // If data is provided, populate the fields
        if (data) {
            langItem.querySelector('.language-name').value = data.language || '';
            const proficiencySelect = langItem.querySelector('.proficiency');
            if (data.proficiency) {
                for (let i = 0; i < proficiencySelect.options.length; i++) {
                    if (proficiencySelect.options[i].value === data.proficiency) {
                        proficiencySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        
        // Add event listeners for all form fields
        const formInputs = langItem.querySelectorAll('input, select');
        formInputs.forEach(input => {
            input.addEventListener('change', updateLanguagesPreview);
            input.addEventListener('input', updateLanguagesPreview);
        });
        
        languageItems.appendChild(langItem);
        updateLanguagesPreview();
    }
    
    /**
     * Update profile section in the preview
     */
    function updateProfilePreview() {
        const previewName = document.getElementById('previewName');
        const previewTitle = document.getElementById('previewTitle');
        const previewEmail = document.getElementById('previewEmail');
        const previewPhone = document.getElementById('previewPhone');
        const previewLocation = document.getElementById('previewLocation');
        
        previewName.textContent = profileName.value || 'Your Name';
        previewTitle.textContent = profileTitle.value || 'Professional Title';
        previewEmail.textContent = profileEmail.value || 'email@example.com';
        previewPhone.textContent = profilePhone.value || '(123) 456-7890';
        previewLocation.textContent = profileLocation.value || 'City, State';
    }
    
    /**
     * Update links section in the preview
     */
    function updateLinksPreview() {
        const previewLinks = document.getElementById('previewLinks');
        previewLinks.innerHTML = '';
        
        // Collect links from form
        const linkItems = document.querySelectorAll('#profileLinks .link-item');
        const links = [];
        
        linkItems.forEach(item => {
            const labelInput = item.querySelector('.link-label');
            const urlInput = item.querySelector('.link-url');
            
            if (labelInput.value && urlInput.value) {
                links.push({
                    label: labelInput.value,
                    url: urlInput.value
                });
                
                // Add to preview
                const linkElement = document.createElement('a');
                linkElement.href = urlInput.value;
                linkElement.textContent = labelInput.value;
                linkElement.target = '_blank';
                linkElement.rel = 'noopener noreferrer';
                previewLinks.appendChild(linkElement);
            }
        });
        
        // Update resumeData
        resumeData.profile.links = links;
    }
    
    /**
     * Update skills section in the preview
     */
    function updateSkillsPreview() {
        const previewSkills = document.getElementById('previewSkills');
        previewSkills.innerHTML = '';
        
        // Add skills to preview
        resumeData.skills.forEach(skill => {
            const skillElement = document.createElement('span');
            skillElement.textContent = skill;
            previewSkills.appendChild(skillElement);
        });
        
        // Show/hide section based on content
        const skillsSection = document.getElementById('skillsSection');
        skillsSection.style.display = resumeData.skills.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Update experience section in the preview
     */
    function updateExperiencePreview() {
        const previewExperience = document.getElementById('previewExperience');
        previewExperience.innerHTML = '';
        
        // Collect experience data from form
        const expItems = document.querySelectorAll('#experienceItems .experience-entry');
        const experience = [];
        
        expItems.forEach(item => {
            const role = item.querySelector('.role').value;
            const company = item.querySelector('.company').value;
            const location = item.querySelector('.location').value;
            const startDate = item.querySelector('.start-date').value;
            const endDate = item.querySelector('.end-date').value;
            
            // Collect bullets
            const bullets = [];
            item.querySelectorAll('.bullet').forEach(bulletInput => {
                if (bulletInput.value.trim()) {
                    bullets.push(bulletInput.value.trim());
                }
            });
            
            if (role || company) {
                experience.push({
                    role,
                    company,
                    location,
                    start: startDate,
                    end: endDate,
                    bullets
                });
                
                // Add to preview
                const expElement = document.createElement('div');
                expElement.className = 'experience-item';
                expElement.innerHTML = `
                    <div class="experience-header">
                        <div class="experience-title">${role}</div>
                        <div class="experience-company">${company}</div>
                    </div>
                    <div class="experience-details">
                        ${location} | ${startDate} - ${endDate}
                    </div>
                `;
                
                if (bullets.length > 0) {
                    const bulletList = document.createElement('ul');
                    bulletList.className = 'experience-bullets';
                    
                    bullets.forEach(bullet => {
                        const bulletItem = document.createElement('li');
                        bulletItem.textContent = bullet;
                        bulletList.appendChild(bulletItem);
                    });
                    
                    expElement.appendChild(bulletList);
                }
                
                previewExperience.appendChild(expElement);
            }
        });
        
        // Update resumeData
        resumeData.experience = experience;
        
        // Show/hide section based on content
        const experienceSection = document.getElementById('experienceSection');
        experienceSection.style.display = experience.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Update education section in the preview
     */
    function updateEducationPreview() {
        const previewEducation = document.getElementById('previewEducation');
        previewEducation.innerHTML = '';
        
        // Collect education data from form
        const eduItems = document.querySelectorAll('#educationItems .education-entry');
        const education = [];
        
        eduItems.forEach(item => {
            const degree = item.querySelector('.degree').value;
            const school = item.querySelector('.school').value;
            const location = item.querySelector('.location').value;
            const startDate = item.querySelector('.start-date').value;
            const endDate = item.querySelector('.end-date').value;
            const details = item.querySelector('.details').value;
            
            if (degree || school) {
                education.push({
                    degree,
                    school,
                    location,
                    start: startDate,
                    end: endDate,
                    details
                });
                
                // Add to preview
                const eduElement = document.createElement('div');
                eduElement.className = 'education-item';
                eduElement.innerHTML = `
                    <div class="education-header">
                        <div class="education-degree">${degree}</div>
                        <div class="education-school">${school}</div>
                    </div>
                    <div class="education-details">
                        ${location} | ${startDate} - ${endDate}
                    </div>
                `;
                
                if (details) {
                    const detailsElement = document.createElement('div');
                    detailsElement.className = 'education-additional';
                    detailsElement.textContent = details;
                    eduElement.appendChild(detailsElement);
                }
                
                previewEducation.appendChild(eduElement);
            }
        });
        
        // Update resumeData
        resumeData.education = education;
        
        // Show/hide section based on content
        const educationSection = document.getElementById('educationSection');
        educationSection.style.display = education.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Update projects section in the preview
     */
    function updateProjectsPreview() {
        const previewProjects = document.getElementById('previewProjects');
        previewProjects.innerHTML = '';
        
        // Collect projects data from form
        const projectItems = document.querySelectorAll('#projectItems .project-entry');
        const projects = [];
        
        projectItems.forEach(item => {
            const name = item.querySelector('.project-name').value;
            const link = item.querySelector('.project-link').value;
            
            // Collect tech tags
            const tech = [];
            item.querySelectorAll('.tech-tag').forEach(tag => {
                const techName = tag.textContent.replace('×', '').trim();
                if (techName) {
                    tech.push(techName);
                }
            });
            
            // Collect bullets
            const bullets = [];
            item.querySelectorAll('.bullet').forEach(bulletInput => {
                if (bulletInput.value.trim()) {
                    bullets.push(bulletInput.value.trim());
                }
            });
            
            if (name) {
                projects.push({
                    name,
                    link,
                    tech,
                    bullets
                });
                
                // Add to preview
                const projectElement = document.createElement('div');
                projectElement.className = 'project-item';
                
                let projectHeader = `<div class="project-header">`;
                projectHeader += `<div class="project-name">${name}</div>`;
                if (tech.length > 0) {
                    projectHeader += `<div class="project-tech">${tech.join(', ')}</div>`;
                }
                projectHeader += `</div>`;
                
                projectElement.innerHTML = projectHeader;
                
                if (link) {
                    const linkElement = document.createElement('div');
                    linkElement.className = 'project-link';
                    const linkAnchor = document.createElement('a');
                    linkAnchor.href = link;
                    linkAnchor.textContent = link;
                    linkAnchor.target = '_blank';
                    linkAnchor.rel = 'noopener noreferrer';
                    linkElement.appendChild(linkAnchor);
                    projectElement.appendChild(linkElement);
                }
                
                if (bullets.length > 0) {
                    const bulletList = document.createElement('ul');
                    bulletList.className = 'project-bullets';
                    
                    bullets.forEach(bullet => {
                        const bulletItem = document.createElement('li');
                        bulletItem.textContent = bullet;
                        bulletList.appendChild(bulletItem);
                    });
                    
                    projectElement.appendChild(bulletList);
                }
                
                previewProjects.appendChild(projectElement);
            }
        });
        
        // Update resumeData
        resumeData.projects = projects;
        
        // Show/hide section based on content
        const projectsSection = document.getElementById('projectsSection');
        projectsSection.style.display = projects.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Update certifications section in the preview
     */
    function updateCertificationsPreview() {
        const previewCertifications = document.getElementById('previewCertifications');
        previewCertifications.innerHTML = '';
        
        // Collect certifications data from form
        const certItems = document.querySelectorAll('#certificationItems .certification-entry');
        const certifications = [];
        
        certItems.forEach(item => {
            const name = item.querySelector('.cert-name').value;
            const issuer = item.querySelector('.cert-issuer').value;
            const year = item.querySelector('.cert-year').value;
            
            if (name) {
                certifications.push({
                    name,
                    issuer,
                    year
                });
                
                // Add to preview
                const certElement = document.createElement('div');
                certElement.className = 'certification-item';
                certElement.innerHTML = `
                    <span class="cert-name">${name}</span>
                    ${issuer ? `<span class="cert-issuer">, ${issuer}</span>` : ''}
                    ${year ? `<span class="cert-year"> (${year})</span>` : ''}
                `;
                
                previewCertifications.appendChild(certElement);
            }
        });
        
        // Update resumeData
        resumeData.certifications = certifications;
        
        // Show/hide section based on content
        const certificationsSection = document.getElementById('certificationsSection');
        certificationsSection.style.display = certifications.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Update languages section in the preview
     */
    function updateLanguagesPreview() {
        const previewLanguages = document.getElementById('previewLanguages');
        previewLanguages.innerHTML = '';
        
        // Collect languages data from form
        const langItems = document.querySelectorAll('#languageItems .language-entry');
        const languages = [];
        
        langItems.forEach(item => {
            const language = item.querySelector('.language-name').value;
            const proficiency = item.querySelector('.proficiency').value;
            
            if (language) {
                languages.push({
                    language,
                    proficiency
                });
                
                // Add to preview
                const langElement = document.createElement('div');
                langElement.className = 'language-item';
                langElement.innerHTML = `
                    <span class="language-name">${language}</span>
                    <span class="language-proficiency"> - ${proficiency}</span>
                `;
                
                previewLanguages.appendChild(langElement);
            }
        });
        
        // Update resumeData
        resumeData.languages = languages;
        
        // Show/hide section based on content
        const languagesSection = document.getElementById('languagesSection');
        languagesSection.style.display = languages.length > 0 ? 'block' : 'none';
    }
    
    /**
     * Collect all data from the form and update the resumeData object
     */
    function collectFormData() {
        // Profile data
        resumeData.profile.name = profileName.value || '';
        resumeData.profile.title = profileTitle.value || '';
        resumeData.profile.email = profileEmail.value || '';
        resumeData.profile.phone = profilePhone.value || '';
        resumeData.profile.location = profileLocation.value || '';
        // Photo is updated in the photo upload event handler
        
        // Links are updated in updateLinksPreview()
        updateLinksPreview();
        
        // Summary
        resumeData.summary = summary.value || '';
        
        // Skills, experience, education, projects, certifications, languages
        // These are updated in their respective update preview functions
        updateSkillsPreview();
        updateExperiencePreview();
        updateEducationPreview();
        updateProjectsPreview();
        updateCertificationsPreview();
        updateLanguagesPreview();
        
        // Update resume date
        document.getElementById('resumeDate').textContent = formatDate(new Date());
    }
    
    /**
     * Populate form fields from resumeData object
     */
    function populateFormFromData() {
        // Clear existing form data
        clearForm();
        
        // Profile data
        profileName.value = resumeData.profile.name || '';
        profileTitle.value = resumeData.profile.title || '';
        profileEmail.value = resumeData.profile.email || '';
        profilePhone.value = resumeData.profile.phone || '';
        profileLocation.value = resumeData.profile.location || '';
        
        // Photo
        if (resumeData.profile.photo) {
            includePhoto.checked = true;
            photoUpload.disabled = false;
            const previewPhoto = document.getElementById('previewPhoto');
            previewPhoto.src = resumeData.profile.photo;
            document.getElementById('previewPhotoContainer').style.display = 'block';
        }
        
        // Links
        if (resumeData.profile.links && resumeData.profile.links.length > 0) {
            // Clear existing links
            profileLinks.innerHTML = '';
            
            resumeData.profile.links.forEach(link => {
                const linkItem = linkTemplate.content.cloneNode(true);
                linkItem.querySelector('.link-label').value = link.label || '';
                linkItem.querySelector('.link-url').value = link.url || '';
                
                setupLinkItem(linkItem);
                profileLinks.appendChild(linkItem);
            });
        }
        
        // Summary
        summary.value = resumeData.summary || '';
        summaryCount.textContent = summary.value.length;
        
        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
            renderSkillTags();
        }
        
        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            resumeData.experience.forEach(exp => {
                addExperienceItem(exp);
            });
        }
        
        // Education
        if (resumeData.education && resumeData.education.length > 0) {
            resumeData.education.forEach(edu => {
                addEducationItem(edu);
            });
        }
        
        // Projects
        if (resumeData.projects && resumeData.projects.length > 0) {
            resumeData.projects.forEach(project => {
                addProjectItem(project);
            });
        }
        
        // Certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
            resumeData.certifications.forEach(cert => {
                addCertificationItem(cert);
            });
        }
        
        // Languages
        if (resumeData.languages && resumeData.languages.length > 0) {
            resumeData.languages.forEach(lang => {
                addLanguageItem(lang);
            });
        }
        
        // Update preview
        updatePreview();
    }
    
    /**
     * Clear all form fields
     */
    function clearForm() {
        // Clear profile fields
        profileName.value = '';
        profileTitle.value = '';
        profileEmail.value = '';
        profilePhone.value = '';
        profileLocation.value = '';
        includePhoto.checked = false;
        photoUpload.disabled = true;
        document.getElementById('previewPhotoContainer').style.display = 'none';
        
        // Clear links
        profileLinks.innerHTML = '';
        
        // Clear summary
        summary.value = '';
        summaryCount.textContent = '0';
        
        // Clear skills
        skillTags.innerHTML = '';
        resumeData.skills = [];
        
        // Clear repeatable sections
        experienceItems.innerHTML = '';
        educationItems.innerHTML = '';
        projectItems.innerHTML = '';
        certificationItems.innerHTML = '';
        languageItems.innerHTML = '';
    }
    
    /**
     * Update all preview sections
     */
    function updatePreview() {
        updateProfilePreview();
        updateLinksPreview();
        document.getElementById('previewSummary').textContent = summary.value;
        updateSkillsPreview();
        updateExperiencePreview();
        updateEducationPreview();
        updateProjectsPreview();
                updateCertificationsPreview();
        updateLanguagesPreview();
    }
    
    /**
     * Adjust the scale of the preview to fit the container
     */
    function adjustPreviewScale() {
        if (window.innerWidth >= 1200) {
            // Reset any scaling for large screens
            document.querySelector('.resume-document').style.transform = 'none';
            return;
        }
        
        const previewPanel = document.getElementById('previewPanel');
        const resumeDoc = document.querySelector('.resume-document');
        
        if (!previewPanel.offsetWidth) return; // Not visible
        
        const availableWidth = previewPanel.offsetWidth - 40; // 20px padding on each side
        const documentWidth = 794; // A4 width in pixels
        
        if (availableWidth < documentWidth) {
            const scale = availableWidth / documentWidth;
            resumeDoc.style.transform = `scale(${scale})`;
            resumeDoc.style.transformOrigin = 'top center';
        } else {
            resumeDoc.style.transform = 'none';
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning)
     */
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Add active class after a brief delay (for animation)
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Remove after timeout
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300); // Match transition duration
        }, 3000);
    }
    
    /**
     * Format a date object to YYYY-MM-DD format
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Debounce function to limit how often a function is called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    /**
     * Function to help render skill tags
     */
    function renderSkillTags() {
        skillTags.innerHTML = '';
        resumeData.skills.forEach((skill, index) => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `${skill} <span>×</span>`;
            
            const removeBtn = tag.querySelector('span');
            removeBtn.addEventListener('click', function() {
                resumeData.skills.splice(index, 1);
                renderSkillTags();
                updateSkillsPreview();
            });
            
            skillTags.appendChild(tag);
        });
    }
    
    /**
     * Initialize with sample data or data from localStorage
     */
    function initializeSampleData() {
        // Try to load data from localStorage first
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                Object.assign(resumeData, parsedData);
                populateFormFromData();
                updatePreview();
                return; // Exit if we successfully loaded from localStorage
            } catch (error) {
                console.error('Error loading saved data:', error);
                // Continue with sample data if there was an error
            }
        }
        
        // Sample data for demonstration
        resumeData.profile = {
            name: 'Alex Johnson',
            title: 'Full Stack Web Developer',
            email: 'alex@example.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            photo: '',
            links: [
                { label: 'LinkedIn', url: 'https://linkedin.com/in/alexjohnson' },
                { label: 'GitHub', url: 'https://github.com/alexjohnson' }
            ]
        };
        
        resumeData.summary = 'Dedicated Full Stack Web Developer with 5+ years of experience building responsive and user-friendly web applications. Specialized in modern JavaScript frameworks and backend technologies with a strong focus on clean, maintainable code and optimal user experience.';
        
        resumeData.skills = ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'HTML5/CSS3', 'Git', 'AWS', 'Docker', 'TypeScript'];
        
        resumeData.experience = [
            {
                role: 'Senior Frontend Developer',
                company: 'TechCorp Inc.',
                location: 'San Francisco, CA',
                start: 'Jan 2022',
                end: 'Present',
                bullets: [
                    'Led development of a React-based dashboard that increased user engagement by 35%',
                    'Optimized frontend performance, reducing load times by 40% and improving core web vitals',
                    'Mentored junior developers and implemented code review best practices'
                ]
            },
            {
                role: 'Full Stack Developer',
                company: 'InnoSoft Solutions',
                location: 'Oakland, CA',
                start: 'Mar 2019',
                end: 'Dec 2021',
                bullets: [
                    'Developed and maintained multiple client-facing applications using the MERN stack',
                    'Implemented authentication system using JWT, reducing security incidents by 90%',
                    'Collaborated with UI/UX designers to implement responsive designs across all platforms'
                ]
            }
        ];
        
        resumeData.education = [
            {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University of California',
                location: 'Berkeley, CA',
                start: 'Aug 2015',
                end: 'May 2019',
                details: 'GPA: 3.8/4.0, Dean\'s List, Computer Science Student Association'
            }
        ];
        
        resumeData.projects = [
            {
                name: 'E-commerce Platform',
                link: 'https://github.com/alexjohnson/ecommerce-platform',
                tech: ['React', 'Node.js', 'MongoDB', 'Stripe API'],
                bullets: [
                    'Built a full-featured e-commerce platform with user authentication and payment processing',
                    'Implemented responsive design principles to ensure compatibility across devices',
                    'Integrated with Stripe for payment processing and AWS S3 for image storage'
                ]
            }
        ];
        
        resumeData.certifications = [
            {
                name: 'AWS Certified Developer',
                issuer: 'Amazon Web Services',
                year: '2021'
            },
            {
                name: 'MongoDB Certified Developer',
                issuer: 'MongoDB Inc.',
                year: '2020'
            }
        ];
        
        resumeData.languages = [
            {
                language: 'English',
                proficiency: 'Native'
            },
            {
                language: 'Spanish',
                proficiency: 'Intermediate'
            }
        ];
        
        populateFormFromData();
        updatePreview();
    }
    
    // Initialize by rendering the preview
    updatePreview();
    
    // Add notification styles dynamically
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: #fff;
            color: #333;
            box-shadow: 0 3px 6px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            font-size: 14px;
            max-width: 300px;
        }
        
        .notification.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification.success {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .notification.error {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
        
        .notification.warning {
            background-color: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
    `;
    document.head.appendChild(styleEl);
});