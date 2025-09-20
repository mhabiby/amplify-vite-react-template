import React from 'react';
import type { Schema } from "../../amplify/data/resource";

interface DoctorCardProps {
  doctor: Schema["Doctor"]["type"];
  office?: Schema["Office"]["type"];
  specialty?: Schema["Specialty"]["type"];
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, office, specialty }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-header">
        {doctor.profileImage && (
          <img 
            src={doctor.profileImage} 
            alt={`${doctor.firstName} ${doctor.lastName}`}
            className="doctor-image"
          />
        )}
        <div className="doctor-info">
          <h3>
            {doctor.title} {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="specialty">{specialty?.name || 'General Practice'}</p>
          <div className={`availability ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
            {doctor.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
          </div>
        </div>
      </div>
      
      <div className="doctor-details">
        {doctor.biography && (
          <p className="biography">{doctor.biography}</p>
        )}
        
        <div className="contact-info">
          {doctor.email && (
            <p>📧 {doctor.email}</p>
          )}
          {doctor.phone && (
            <p>📞 {doctor.phone}</p>
          )}
        </div>
        
        {office && (
          <div className="office-info">
            <h4>Office Location</h4>
            <p>Room {office.roomNumber}, Floor {office.floor}</p>
            <p>{office.building}</p>
            {office.description && <p>{office.description}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

interface OfficeCardProps {
  office: Schema["Office"]["type"];
}

export const OfficeCard: React.FC<OfficeCardProps> = ({ office }) => {
  return (
    <div className="office-card">
      <h3>Room {office.roomNumber}</h3>
      <p>Floor {office.floor} - {office.building}</p>
      {office.description && <p>{office.description}</p>}
      {office.capacity && <p>Capacity: {office.capacity}</p>}
      {office.amenities && office.amenities.length > 0 && (
        <div className="amenities">
          <h4>Amenities:</h4>
          <ul>
            {office.amenities.map((amenity, index) => (
              <li key={index}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface SpecialtyCardProps {
  specialty: Schema["Specialty"]["type"];
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ specialty }) => {
  return (
    <div className="specialty-card">
      <h3>{specialty.name}</h3>
      {specialty.department && <p className="department">{specialty.department}</p>}
      {specialty.description && <p>{specialty.description}</p>}
    </div>
  );
};