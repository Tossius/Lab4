        // Global array to store all profiles
        let profiles = [];

        // Validation functions
        function validateRequired(value, fieldName) {
            const err = document.getElementById(`err-${fieldName}`);
            if (!value || value.trim() === '') {
                err.textContent = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
                return false;
            } else {
                err.textContent = '';
                return true;
            }
        }

        function validateEmail(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const err = document.getElementById("err-email");
            if (!value) {
                err.textContent = "Email is required.";
                return false;
            } else if (!emailRegex.test(value)) {
                err.textContent = "Please enter a valid email address.";
                return false;
            } else {
                err.textContent = "";
                return true;
            }
        }

        function validateUrl(value) {
            const err = document.getElementById("err-photoUrl");
            if (value && value.trim() !== '') {
                try {
                    new URL(value);
                    err.textContent = "";
                    return true;
                } catch {
                    err.textContent = "Please enter a valid URL.";
                    return false;
                }
            } else {
                err.textContent = "";
                return true;
            }
        }

        function validateYear() {
            const year = document.querySelector('input[name="year"]:checked');
            const err = document.getElementById("err-year");
            if (!year) {
                err.textContent = "Please select a year of study.";
                return false;
            } else {
                err.textContent = "";
                return true;
            }
        }

        // Real-time validation
        document.getElementById('firstName').addEventListener('blur', function() {
            validateRequired(this.value, 'firstName');
        });

        document.getElementById('lastName').addEventListener('blur', function() {
            validateRequired(this.value, 'lastName');
        });

        document.getElementById('email').addEventListener('blur', function() {
            validateEmail(this.value);
        });

        document.getElementById('programme').addEventListener('change', function() {
            validateRequired(this.value, 'programme');
        });

        document.getElementById('photoUrl').addEventListener('blur', function() {
            validateUrl(this.value);
        });

        document.querySelectorAll('input[name="year"]').forEach(radio => {
            radio.addEventListener('change', validateYear);
        });

        // Create profile card
        function createProfileCard(data, index) {
            const card = document.createElement('div');
            card.className = 'card-person new';
            card.setAttribute('data-index', index);
            
            card.innerHTML = `
                <button class="remove-btn" onclick="removeProfile(${index})" aria-label="Remove ${data.firstName} ${data.lastName}'s profile">×</button>
                <img src="${data.photoUrl || 'https://placehold.co/128x128/4f46e5/white?text=' + data.firstName.charAt(0) + data.lastName.charAt(0)}" 
                     alt="${data.firstName} ${data.lastName}" 
                     onerror="this.src='https://placehold.co/128x128/4f46e5/white?text=${data.firstName.charAt(0)}${data.lastName.charAt(0)}'">
                <h3>${data.firstName} ${data.lastName}</h3>
                <p><span class="badge">${data.programme}</span> <span class="badge">Year ${data.year}</span></p>
                <p><strong>Email:</strong> ${data.email}</p>
                ${data.interests ? `<p><strong>Interests:</strong> ${data.interests}</p>` : ''}
            `;
            
            return card;
        }

        // Create table row
        function createTableRow(data, index) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            
            tr.innerHTML = `
                <td>${data.firstName} ${data.lastName}</td>
                <td>${data.email}</td>
                <td>${data.programme}</td>
                <td>${data.year}</td>
                <td><button onclick="removeProfile(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remove</button></td>
            `;
            
            return tr;
        }

        // Add new profile
        function addProfile(data) {
            const index = profiles.length;
            profiles.push(data);
            
            const cardsContainer = document.getElementById('cards');
            const emptyState = cardsContainer.querySelector('.empty-state');
            
            // Remove empty state if it exists
            if (emptyState) {
                emptyState.remove();
            }
            
            // Add card
            const card = createProfileCard(data, index);
            cardsContainer.prepend(card);
            
            // Add table row
            const tableBody = document.querySelector('#summary tbody');
            const row = createTableRow(data, index);
            tableBody.prepend(row);
            
            // Update live region for screen readers
            document.getElementById('live').textContent = `Profile for ${data.firstName} ${data.lastName} has been added successfully.`;
        }

        // Remove profile
        function removeProfile(index) {
            // Remove from profiles array
            profiles.splice(index, 1);
            
            // Remove card
            const card = document.querySelector(`.card-person[data-index="${index}"]`);
            if (card) card.remove();
            
            // Remove table row
            const row = document.querySelector(`tr[data-index="${index}"]`);
            if (row) row.remove();
            
            // Update indices for remaining items
            updateIndices();
            
            // Check if we need to show empty state
            const cardsContainer = document.getElementById('cards');
            if (cardsContainer.children.length === 0) {
                cardsContainer.innerHTML = '<div class="empty-state">No profiles yet. Submit the form to create your first profile card!</div>';
            }
            
            // Update live region
            document.getElementById('live').textContent = 'Profile has been removed successfully.';
        }

        // Update data indices after removal
        function updateIndices() {
            document.querySelectorAll('.card-person').forEach((card, newIndex) => {
                card.setAttribute('data-index', newIndex);
                const removeBtn = card.querySelector('.remove-btn');
                removeBtn.setAttribute('onclick', `removeProfile(${newIndex})`);
            });
            
            document.querySelectorAll('#summary tbody tr').forEach((row, newIndex) => {
                row.setAttribute('data-index', newIndex);
                const removeBtn = row.querySelector('button');
                removeBtn.setAttribute('onclick', `removeProfile(${newIndex})`);
            });
        }

        // Form submission
        document.getElementById('regForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                email: formData.get('email').trim(),
                programme: formData.get('programme'),
                year: formData.get('year'),
                interests: formData.get('interests').trim(),
                photoUrl: formData.get('photoUrl').trim()
            };
            
            // Validate all fields
            let isValid = true;
            
            isValid &= validateRequired(data.firstName, 'firstName');
            isValid &= validateRequired(data.lastName, 'lastName');
            isValid &= validateEmail(data.email);
            isValid &= validateRequired(data.programme, 'programme');
            isValid &= validateYear();
            isValid &= validateUrl(data.photoUrl);
            
            if (isValid) {
                addProfile(data);
                this.reset();
                document.getElementById('live').textContent = `Success! Profile for ${data.firstName} ${data.lastName} has been created.`;
            } else {
                document.getElementById('live').textContent = 'Please fix the errors in the form before submitting.';
            }
        });