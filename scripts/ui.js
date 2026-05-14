export function renderDoctors(doctors, doctorsContainer) {
  if (!doctorsContainer) return;

  doctorsContainer.innerHTML = '';

  doctors.forEach(doctor => {
    const cardElement = document.createElement('div');
    cardElement.className = "card doctor-card";
    cardElement.innerHTML = generateDoctorCard(doctor);

    doctorsContainer.appendChild(cardElement);
  });
}

function generateDoctorCard(doctor) {
  return `   <div class="doctor-card-top">
                 <div class="doctor-photo">Фото</div>
                 <div class="doctor-info-basic">
                     <div class="doctor-name">${doctor.fullName}</div>
                     <div class="doctor-specialty">${doctor.spec}</div>
                     <div class="doctor-badges">
                         <span class="badge badge-outline">Стаж: ${doctor.experience} лет</span>
                     </div>
                 </div>
             </div>
             <div class="doctor-services">
                   <div class="pills-container">
                     ${doctor.services.map(service => `<span class="badge badge-primary">${service}</span>`).join('')}
                   </div>
                   <div class="schedule-container">
                   <span class="schedule-title">Ближайшая запись:</span>
                   ${doctor.nearest.map(slot => `<span class="badge badge-secondary">${slot}</span>`).join('')}
                   </div>
               </div>
               <div class="doctor-actions">
                 <a href="appointment.html#step-3" class="btn btn-secondary btn-sm btn-full">Записаться к врачу</a>
               </div>  
           </div>`;
}

function formatDate(date) {

}