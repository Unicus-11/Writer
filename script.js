// Handles active state color change on click

// 1. Remove browser focus state immediately when a card is clicked
document.querySelectorAll('.article-card').forEach(card => {
card.addEventListener('click', function() {
 this.blur();
});
});

// 2. Clear any lingering active/focus states when returning to the tab
window.addEventListener('pageshow', () => {
if (document.activeElement instanceof HTMLElement) {
 document.activeElement.blur();
}
});

document.addEventListener('DOMContentLoaded', () => {
   // 1. Floating Navbar Active Link Logic
   const navLinks = document.querySelectorAll('.nav-pill .nav-link');
   const sections = document.querySelectorAll('section[id], div[id], header[id]');
 
   function setActiveLink(target) {
     navLinks.forEach(link => {
       link.classList.remove('active');
       link.style.backgroundColor = '';
       link.style.color = '';
     });
     if (target) {
       target.classList.add('active');
     }
   }
 
   // Move orange pill on click
   navLinks.forEach(link => {
     link.addEventListener('click', function () {
       setActiveLink(this);
     });
   });
 
   // Move orange pill on scroll
   window.addEventListener('scroll', () => {
     let currentSectionId = '';
 
     sections.forEach(section => {
       const sectionTop = section.offsetTop - 150;
       if (window.scrollY >= sectionTop) {
         currentSectionId = section.getAttribute('id');
       }
     });
 
     if (currentSectionId) {
       const activeLink = document.querySelector(`.nav-pill .nav-link[href="#${currentSectionId}"]`);
       if (activeLink) {
         setActiveLink(activeLink);
       }
     }
   });
 
   // Highlight tab on initial load if hash present
   if (window.location.hash) {
     const initialLink = document.querySelector(`.nav-pill .nav-link[href="${window.location.hash}"]`);
     if (initialLink) {
       setActiveLink(initialLink);
     }
   }
 
   // 2. Book Cover Direct Navigation
   const bookLink = document.querySelector('.book-cover-link');
   if (bookLink) {
     bookLink.addEventListener('click', (e) => {
       e.stopPropagation();
     });
   }
 });
 
 // Accordion Single-Open Logic
 const faqItems = document.querySelectorAll('.faq-item');
 faqItems.forEach((item) => {
   item.addEventListener('click', () => {
     if (!item.hasAttribute('open')) {
       faqItems.forEach((otherItem) => {
         if (otherItem !== item) {
           otherItem.removeAttribute('open');
         }
       });
     }
   });
 });
 
 // Pen Cursor & Eye Pupil Tracking Logic
 const pen = document.querySelector('.pen-cursor');
 const ink = document.querySelector('.ink-follower');
 const pupils = document.querySelectorAll('.pupil');
 
 document.addEventListener('mousemove', (e) => {
   const { clientX: x, clientY: y } = e;
 
   if (pen && ink) {
     pen.style.left = `${x}px`;
     pen.style.top = `${y}px`;
     
     ink.style.left = `${x}px`;
     ink.style.top = `${y}px`;
   }
 
   pupils.forEach((pupil) => {
     const eye = pupil.parentElement;
     const rect = eye.getBoundingClientRect();
     
     const eyeCenterX = rect.left + rect.width / 2;
     const eyeCenterY = rect.top + rect.height / 2;
     
     const deltaX = x - eyeCenterX;
     const deltaY = y - eyeCenterY;
     
     const distance = Math.hypot(deltaX, deltaY);
     const angle = Math.atan2(deltaY, deltaX);
     
     const maxOffset = 8; 
     const offset = Math.min(distance, maxOffset);
     
     const pupilX = Math.cos(angle) * offset;
     const pupilY = Math.sin(angle) * offset;
     
     pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
   });
 });
 
 // Hover Effect on Interactive Elements
 const hoverables = document.querySelectorAll('a, button, summary, input, .faq-question');
 hoverables.forEach((el) => {
   el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
   el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
 });
 
 document.addEventListener('keydown', (e) => {
   // Press Ctrl + Shift + A (or Cmd + Shift + A on Mac) to open Admin Panel
   if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
     window.location.href = 'admin.html';
   }
 });
 


   import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
   // Supabase Configuration
   const supabaseUrl = 'https://epdxwonziuyjwqykseez.supabase.co';
   const supabaseKey = 'sb_publishable_cK2ciA4oV6-_HvPaMesoxg_xy0Tiy8n';
   const supabase = createClient(supabaseUrl, supabaseKey);
 
   const newsletterForm = document.getElementById('newsletter-form');
   const formResult = document.getElementById('form-result');
   const submitBtn = document.getElementById('submit-btn');
 
   if (newsletterForm) {
     newsletterForm.addEventListener('submit', async (e) => {
       e.preventDefault();
 
       const emailInput = document.getElementById('update-email').value.trim();
 
       // UI Loading state
       submitBtn.disabled = true;
       submitBtn.innerHTML = 'SAVING...';
       formResult.textContent = '';
 
       try {
         // Insert email into Supabase 'Subscribers' table
         const { data, error } = await supabase
           .from('Subscribers')
           .insert([{ email: emailInput }]);
 
         if (error) {
           // Handle unique constraint duplicate email error gracefully
           if (error.code === '23505') {
             formResult.style.color = '#b84a39';
             formResult.textContent = 'This email is already subscribed!';
           } else {
             console.error('Supabase Insert Error:', error.message);
             formResult.style.color = '#b84a39';
             formResult.textContent = 'Submission error: ' + error.message;
           }
         } else {
           // Success message
           formResult.style.color = '#2b211a';
           formResult.textContent = 'Thank you! You have been added to the list.';
           newsletterForm.reset();
         }
       } catch (err) {
         console.error('Network Error:', err);
         formResult.style.color = '#b84a39';
         formResult.textContent = 'Connection error. Please try again.';
       } finally {
         submitBtn.disabled = false;
         submitBtn.innerHTML = 'SUBMIT <span>&rarr;</span>';
       }
     });
   }