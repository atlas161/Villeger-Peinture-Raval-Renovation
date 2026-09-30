'use strict';
// Slider Avant/Après interactif
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('beforeAfterSlider');
  const handle = document.getElementById('sliderHandle');
  const imageBefore = document.getElementById('imageBefore');
  
  if (!slider || !handle || !imageBefore) return;
  
  let isDragging = false;
  
  function updateSlider(x) {
    const rect = slider.getBoundingClientRect();
    const position = Math.max(0, Math.min(x - rect.left, rect.width));
    const percentage = (position / rect.width) * 100;
    
    handle.style.left = percentage + '%';
    imageBefore.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
  }
  
  // Mouse events
  slider.addEventListener('mousedown', function(e) {
    isDragging = true;
    updateSlider(e.clientX);
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });
  
  document.addEventListener('mouseup', function() {
    isDragging = false;
  });
  
  // Touch events pour mobile
  slider.addEventListener('touchstart', function(e) {
    isDragging = true;
    updateSlider(e.touches[0].clientX);
  });
  
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    updateSlider(e.touches[0].clientX);
  }, { passive: false });
  
  document.addEventListener('touchend', function() {
    isDragging = false;
  });
  
  // Hover sur le slider pour montrer l'interactivité
  slider.addEventListener('mouseenter', function() {
    handle.style.transition = 'none';
  });
  
  slider.addEventListener('mouseleave', function() {
    if (!isDragging) {
      handle.style.transition = 'left 0.1s ease-out';
    }
  });
});
