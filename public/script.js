// Initialize Google Map
function initMap() {
    // Your location coordinates (example: New York)
    const location = { lat: 40.7128, lng: -74.0060 };

    // Create map centered at location
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: location,
        styles: [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f3f3f3' }, { lightness: 20 }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [{ color: '#fadfc0' }, { lightness: 17 }]
            },
            {
                featureType: 'road.arterial',
                elementType: 'geometry.fill',
                stylers: [{ color: '#fae4c1' }, { lightness: 18 }]
            }
        ]
    });

    // Add marker for your location
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'Our Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#667eea',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2
        }
    });

    // Info window for marker
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="color: #333; font-family: Arial; font-size: 14px;">
                <strong>Our Office</strong><br>
                123 Main Street<br>
                City, State 12345<br>
                <strong>Phone:</strong> +1 (555) 123-4567<br>
                <strong>Email:</strong> contact@example.com
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Handle Contact Form Submission
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const service = document.getElementById('service').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseDiv = document.getElementById('responseMessage');

    // Basic client-side validation
    if (!name || !email || !subject || !message) {
        showResponse('Please fill all required fields', 'error');
        return;
    }

    // Email validation
    if (!isValidEmail(email)) {
        showResponse('Please enter a valid email address', 'error');
        return;
    }

    // Disable submit button
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, phone, subject, service, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showResponse(data.message, 'success');
            document.getElementById('contactForm').reset();
        } else {
            showResponse(data.message || 'Error sending message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showResponse('Network error. Please try again later.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Helper function to show response message
function showResponse(message, type) {
    const responseDiv = document.getElementById('responseMessage');
    responseDiv.textContent = message;
    responseDiv.className = `response-message ${type}`;

    // Auto-hide success message after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            responseDiv.className = 'response-message';
        }, 5000);
    }
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Initialize map when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    initMap();
}
