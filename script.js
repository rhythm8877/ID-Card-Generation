document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const form = document.getElementById('registrationForm');
    const formContainer = document.getElementById('formContainer');
    const idCardContainer = document.getElementById('idCardContainer');
    const contactInput = document.getElementById('contact');
    const headerTitle = document.querySelector('.header-bottom h1');
    const downloadBtn = document.querySelector('.download-btn');
    let firebaseAvailable = true; // Flag to track if Firebase is available
  
    // Check if Firebase is properly initialized
    try {
      if (!firebase || !firebase.firestore) {
        console.error('Firebase or Firestore is not available');
        firebaseAvailable = false;
      }
    } catch (error) {
      console.error('Error checking Firebase:', error);
      firebaseAvailable = false;
    }
  
    // Make photo preview clickable to trigger file upload
    photoPreview.addEventListener('click', () => {
        photoInput.click();
    });
  
    // Validate contact field to only accept numbers
    contactInput.addEventListener('input', function(e) {
        // Remove any non-numeric characters
        this.value = this.value.replace(/\D/g, '');
        
        // Ensure it doesn't exceed 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
  
    // Photo upload preview
    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                photoPreview.classList.add('has-image');
                console.log('Photo preview updated');
                
                // Clear any existing error message when photo is uploaded
                const photoError = document.getElementById('photoError');
                photoError.textContent = '';
                photoError.classList.remove('show');
            }
            reader.readAsDataURL(file);
        }
    });
  
    // Form submission
    form.addEventListener('submit', async (e) => {
        console.log('Form submitted');
        e.preventDefault();
  
        // Validate contact number has exactly 10 digits
        if (contactInput.value.length !== 10 || !/^\d{10}$/.test(contactInput.value)) {
            alert('Please enter exactly 10 digits for the contact number');
            contactInput.focus();
            return;
        }
  
        // Check if photo is uploaded
        const photoError = document.getElementById('photoError');
        if (!photoInput.files || photoInput.files.length === 0) {
            photoError.textContent = 'Please upload your image';
            photoError.classList.add('show');
            alert('Please upload your image');
            console.log('Photo not uploaded',"image error");
            photoPreview.scrollIntoView({ behavior: 'smooth' });
            return;
        } else {
            photoError.textContent = '';
            photoError.classList.remove('show');
        }
  
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
  
        try {
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                contact: document.getElementById('contact').value,
                email: document.getElementById('email').value,
                college: document.getElementById('college').value,
                degree: document.getElementById('degree').value,
                semester: document.getElementById('semester').value,
                createdAt: firebaseAvailable ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
            };
  
            let registrationNumber = "YUVA001"; // Default fallback
  
            // Get next registration number if Firebase is available
            if (firebaseAvailable) {
                try {
                    const nextNumber = await getNextRegistrationNumber();
                    registrationNumber = `YUVA00${nextNumber}`;
                    formData.registrationNumber = registrationNumber;
                    
                    // Save data to Firestore
                    const docRef = await idCardsCollection.add(formData);
                    console.log('Document written with ID: ', docRef.id);
                    formData.id = docRef.id;
                } catch (firestoreError) {
                    console.error('Firestore error:', firestoreError);
                    // Continue without Firestore
                    firebaseAvailable = false;
                    // Use timestamp for registration number as fallback
                    const timestamp = Date.now();
                    registrationNumber = `YUVA00${timestamp % 10000}`;
                    formData.registrationNumber = registrationNumber;
                }
            } else {
                // Use timestamp for registration number as fallback
                const timestamp = Date.now();
                registrationNumber = `YUVA00${timestamp % 10000}`;
                formData.registrationNumber = registrationNumber;
            }
  
            // Save data to Firebase if available
            if (firebaseAvailable) {
                try {
                    console.log('Attempting to save data to Firebase...');
                    
                    // Create a copy of formData that we can modify
                    const firestoreData = {
                        ...formData,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Save photo to Firebase Storage
                    const photoFile = photoInput.files[0];
                    if (photoFile) {
                        console.log('Uploading photo to Firebase Storage...');
                        const storageRef = firebase.storage().ref();
                        const photoRef = storageRef.child(`member-photos/${formData.registrationNumber}-${Date.now()}`);
                        
                        // Upload the photo
                        const uploadTask = photoRef.put(photoFile);
                        
                        // Listen for upload completion
                        uploadTask.on('state_changed', 
                            (snapshot) => {
                                // Progress monitoring if needed
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log('Upload progress: ' + progress + '%');
                            },
                            (error) => {
                                console.error('Error uploading photo:', error);
                                console.log('Error details:', error);
                            },
                            async () => {
                                try {
                                    // Upload completed, get download URL
                                    console.log('Photo upload complete, getting download URL...');
                                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                    
                                    // Add download URL to form data
                                    firestoreData.photoURL = downloadURL;
                                    
                                    // Save form data to Firestore
                                    console.log('Saving data to Firestore with photo URL...');
                                    await idCardsCollection.doc(formData.registrationNumber).set(firestoreData);
                                    console.log('Data successfully saved to Firebase with photo URL:', firestoreData);
                                } catch (innerError) {
                                    console.error('Error in photo upload completion handler:', innerError);
                                    console.log('Inner error details:', innerError);
                                }
                            }
                        );
                    } else {
                        // No photo, just save form data
                        console.log('No photo, saving data directly to Firestore...');
                        await idCardsCollection.doc(formData.registrationNumber).set(firestoreData);
                        console.log('Data successfully saved to Firebase (no photo):', firestoreData);
                    }
                } catch (firestoreError) {
                    console.error('Error saving to Firebase:', firestoreError);
                    console.log('Firestore error details:', firestoreError);
                }
            }
            
            // Update ID Card with registration number
            updateIDCard(formData);
            
            // Hide form and show ID card
            formContainer.style.display = 'none';
            idCardContainer.style.display = 'block';
            
            // Change header text
            headerTitle.textContent = 'ID Card Generated';
            
            // Enable download button
            downloadBtn.disabled = false;
            
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } catch (error) {
            console.error('Error processing form: ', error);
            alert('An error occurred while processing your data. Please try again.');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
  });
  
  function updateIDCard(data) {
    // Get the photo file from the input
    const photoFile = document.getElementById('photo').files[0];
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('idPhoto').src = e.target.result;
        }
        reader.readAsDataURL(photoFile);
    }
  
    document.getElementById('idName').textContent = data.name;
    document.getElementById('idContact').textContent = data.contact;
    document.getElementById('idEmail').textContent = data.email;
    document.getElementById('idCollege').textContent = data.college;
    
    // Ensure degree and semester fields are not displayed
    const degreeElement = document.querySelector('.id-details p span#idDegree');
    if (degreeElement) {
        const degreeParagraph = degreeElement.closest('p');
        if (degreeParagraph) {
            degreeParagraph.style.display = 'none';
        }
    }
    
    const semesterElement = document.querySelector('.id-details p span#idSemester');
    if (semesterElement) {
        const semesterParagraph = semesterElement.closest('p');
        if (semesterParagraph) {
            semesterParagraph.style.display = 'none';
        }
    }
    
    // Add registration number to ID card
    if (data.registrationNumber) {
        // Check if registration number element exists, if not create it
        let regNoElement = document.getElementById('idRegNo');
        if (!regNoElement) {
            // Find the id-details div
            const idDetails = document.querySelector('.id-details');
            
            // Create a new paragraph for registration number
            const regNoPara = document.createElement('p');
            regNoPara.innerHTML = '<span>Reg No:</span> <span id="idRegNo"></span>';
            
            // Insert it as the first child of id-details
            idDetails.insertBefore(regNoPara, idDetails.firstChild);
            
            regNoElement = document.getElementById('idRegNo');
        }
        
        // Set the registration number
        regNoElement.textContent = data.registrationNumber;
    }
  }
  
  function downloadID() {
    html2canvas(document.querySelector('.id-card')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'student-id.png';
        link.href = canvas.toDataURL();
        link.click();
    });
  }