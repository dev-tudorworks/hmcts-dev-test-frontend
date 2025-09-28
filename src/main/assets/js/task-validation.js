// Client-side form validation for task management
document.addEventListener('DOMContentLoaded', function() {
  // Task creation and edit form validation
  const taskForms = document.querySelectorAll('form[action*="/tasks"]');
  
  taskForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      let hasErrors = false;
      const errors = [];
      
      // Clear existing error styling
      const errorInputs = form.querySelectorAll('.govuk-input--error, .govuk-textarea--error');
      errorInputs.forEach(input => {
        input.classList.remove('govuk-input--error', 'govuk-textarea--error');
      });
      
      const existingErrors = form.querySelectorAll('.govuk-error-message');
      existingErrors.forEach(error => error.remove());
      
      // Title validation
      const titleInput = form.querySelector('input[name="title"]');
      if (titleInput) {
        const title = titleInput.value.trim();
        if (!title) {
          hasErrors = true;
          titleInput.classList.add('govuk-input--error');
          addErrorMessage(titleInput, 'Title is required');
          errors.push({ text: 'Title is required', href: '#title' });
        } else if (title.length < 3) {
          hasErrors = true;
          titleInput.classList.add('govuk-input--error');
          addErrorMessage(titleInput, 'Title must be at least 3 characters long');
          errors.push({ text: 'Title must be at least 3 characters long', href: '#title' });
        }
      }
      
      // Description validation
      const descriptionInput = form.querySelector('textarea[name="description"]');
      if (descriptionInput) {
        const description = descriptionInput.value.trim();
        if (!description) {
          hasErrors = true;
          descriptionInput.classList.add('govuk-textarea--error');
          addErrorMessage(descriptionInput, 'Description is required');
          errors.push({ text: 'Description is required', href: '#description' });
        } else if (description.length < 10) {
          hasErrors = true;
          descriptionInput.classList.add('govuk-textarea--error');
          addErrorMessage(descriptionInput, 'Description must be at least 10 characters long');
          errors.push({ text: 'Description must be at least 10 characters long', href: '#description' });
        }
      }
      
      // Due date validation
      const dayInput = form.querySelector('input[name="due-date-day"]');
      const monthInput = form.querySelector('input[name="due-date-month"]');
      const yearInput = form.querySelector('input[name="due-date-year"]');
      
      if (dayInput && monthInput && yearInput) {
        const day = dayInput.value.trim();
        const month = monthInput.value.trim();
        const year = yearInput.value.trim();
        
        // If any date field has a value, all must have values
        if (day || month || year) {
          if (!day || !month || !year) {
            hasErrors = true;
            [dayInput, monthInput, yearInput].forEach(input => {
              input.classList.add('govuk-input--error');
            });
            addErrorMessage(dayInput.parentNode.parentNode.parentNode, 'Please enter a complete due date or leave all fields blank');
            errors.push({ text: 'Please enter a complete due date or leave all fields blank', href: '#due-date-day' });
          } else {
            // Validate the date is real
            const dayNum = parseInt(day);
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            
            if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
                dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2020) {
              hasErrors = true;
              [dayInput, monthInput, yearInput].forEach(input => {
                input.classList.add('govuk-input--error');
              });
              addErrorMessage(dayInput.parentNode.parentNode.parentNode, 'Please enter a valid due date');
              errors.push({ text: 'Please enter a valid due date', href: '#due-date-day' });
            } else {
              // Check if the date is valid
              const dateObj = new Date(yearNum, monthNum - 1, dayNum);
              if (dateObj.getDate() !== dayNum || dateObj.getMonth() !== monthNum - 1) {
                hasErrors = true;
                [dayInput, monthInput, yearInput].forEach(input => {
                  input.classList.add('govuk-input--error');
                });
                addErrorMessage(dayInput.parentNode.parentNode.parentNode, 'Please enter a valid due date');
                errors.push({ text: 'Please enter a valid due date', href: '#due-date-day' });
              } else {
                // Check if the date is in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (dateObj < today) {
                  hasErrors = true;
                  [dayInput, monthInput, yearInput].forEach(input => {
                    input.classList.add('govuk-input--error');
                  });
                  addErrorMessage(dayInput.parentNode.parentNode.parentNode, 'Due date cannot be in the past');
                  errors.push({ text: 'Due date cannot be in the past', href: '#due-date-day' });
                }
              }
            }
          }
        }
      }
      
      // If there are errors, prevent submission and show error summary
      if (hasErrors) {
        e.preventDefault();
        showErrorSummary(errors);
        // Scroll to top of page to show error summary
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  
  // Helper function to add error message to a field
  function addErrorMessage(element, message) {
    const errorElement = document.createElement('span');
    errorElement.className = 'govuk-error-message';
    errorElement.innerHTML = '<span class="govuk-visually-hidden">Error:</span> ' + message;
    
    // Insert error message after the element or its parent form group
    const formGroup = element.closest('.govuk-form-group') || element.parentNode;
    if (formGroup.querySelector('.govuk-label')) {
      // Insert after label and hint
      const hint = formGroup.querySelector('.govuk-hint');
      if (hint) {
        hint.parentNode.insertBefore(errorElement, hint.nextSibling);
      } else {
        const label = formGroup.querySelector('.govuk-label');
        label.parentNode.insertBefore(errorElement, label.nextSibling);
      }
    } else {
      element.parentNode.insertBefore(errorElement, element);
    }
  }
  
  // Helper function to show error summary
  function showErrorSummary(errors) {
    // Remove existing error summary
    const existingSummary = document.querySelector('.govuk-error-summary');
    if (existingSummary) {
      existingSummary.remove();
    }
    
    // Create error summary
    const errorSummary = document.createElement('div');
    errorSummary.className = 'govuk-error-summary';
    errorSummary.setAttribute('role', 'alert');
    errorSummary.setAttribute('aria-labelledby', 'error-summary-title');
    errorSummary.setAttribute('tabindex', '-1');
    
    let summaryHTML = `
      <h2 class="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div class="govuk-error-summary__body">
        <ul class="govuk-list govuk-error-summary__list">
    `;
    
    errors.forEach(error => {
      summaryHTML += `<li><a href="${error.href}">${error.text}</a></li>`;
    });
    
    summaryHTML += `
        </ul>
      </div>
    `;
    
    errorSummary.innerHTML = summaryHTML;
    
    // Insert at the beginning of the main content
    const mainContent = document.querySelector('main') || document.body;
    const firstChild = mainContent.firstElementChild;
    mainContent.insertBefore(errorSummary, firstChild);
    
    // Focus the error summary
    errorSummary.focus();
  }
  
  // Search form validation
  const searchForm = document.querySelector('form[action*="/search"]');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const searchInput = searchForm.querySelector('input[name="q"]');
      if (searchInput && !searchInput.value.trim()) {
        e.preventDefault();
        searchInput.focus();
        alert('Please enter a search term');
      }
    });
  }
  
  // Delete confirmation
  const deleteForms = document.querySelectorAll('form[action*="/delete"]');
  deleteForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      const taskTitle = document.querySelector('h1.govuk-heading-xl')?.textContent || 'this task';
      if (!confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
        e.preventDefault();
      }
    });
  });
  
  // Auto-resize textarea
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(function(textarea) {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });
});