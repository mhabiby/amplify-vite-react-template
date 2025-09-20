import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AIAgentChat } from "./components/AIAgentChat";
import { DoctorCard, OfficeCard, SpecialtyCard } from "./components/DirectoryCards";
import type { AIAgentResponse } from "./utils/aiAgent";
import "./App.css";

const client = generateClient<Schema>();

function App() {
  const [doctors, setDoctors] = useState<Array<Schema["Doctor"]["type"]>>([]);
  const [offices, setOffices] = useState<Array<Schema["Office"]["type"]>>([]);
  const [specialties, setSpecialties] = useState<Array<Schema["Specialty"]["type"]>>([]);
  const [searchResults, setSearchResults] = useState<AIAgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [doctorsResult, officesResult, specialtiesResult] = await Promise.all([
          client.models.Doctor.list(),
          client.models.Office.list(),
          client.models.Specialty.list()
        ]);

        setDoctors(doctorsResult.data || []);
        setOffices(officesResult.data || []);
        setSpecialties(specialtiesResult.data || []);

        // If no data exists, create some sample data
        if (doctorsResult.data?.length === 0) {
          await createSampleData();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const createSampleData = async () => {
    try {
      // Create sample specialties
      const cardiology = await client.models.Specialty.create({
        name: "Cardiology",
        description: "Heart and cardiovascular system specialists",
        department: "Internal Medicine"
      });

      const dermatology = await client.models.Specialty.create({
        name: "Dermatology", 
        description: "Skin, hair, and nail specialists",
        department: "Surgery"
      });

      // Create sample offices
      const office201 = await client.models.Office.create({
        roomNumber: "201",
        floor: 2,
        building: "Medical Center East",
        description: "Cardiology consultation room",
        capacity: 3,
        amenities: ["Wheelchair accessible", "Waiting area"]
      });

      const office305 = await client.models.Office.create({
        roomNumber: "305", 
        floor: 3,
        building: "Medical Center East",
        description: "Dermatology examination room",
        capacity: 2,
        amenities: ["Dermatoscope", "UV lamp"]
      });

      // Create sample doctors
      await client.models.Doctor.create({
        firstName: "Sarah",
        lastName: "Johnson",
        title: "Dr.",
        email: "s.johnson@medcenter.com",
        phone: "(555) 123-4567",
        officeId: office201.data?.id,
        specialtyId: cardiology.data?.id,
        isAvailable: true,
        biography: "Board-certified cardiologist with 15 years of experience in treating heart conditions."
      });

      await client.models.Doctor.create({
        firstName: "Michael",
        lastName: "Chen",
        title: "Dr.",
        email: "m.chen@medcenter.com", 
        phone: "(555) 234-5678",
        officeId: office305.data?.id,
        specialtyId: dermatology.data?.id,
        isAvailable: true,
        biography: "Dermatologist specializing in skin cancer detection and cosmetic procedures."
      });

      // Reload data after creating samples
      const [doctorsResult, officesResult, specialtiesResult] = await Promise.all([
        client.models.Doctor.list(),
        client.models.Office.list(),
        client.models.Specialty.list()
      ]);

      setDoctors(doctorsResult.data || []);
      setOffices(officesResult.data || []);
      setSpecialties(specialtiesResult.data || []);
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  const handleAIResults = (response: AIAgentResponse) => {
    setSearchResults(response);
  };

  const getRelatedData = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return { doctor: null, office: null, specialty: null };

    const office = offices.find(o => o.id === doctor.officeId);
    const specialty = specialties.find(s => s.id === doctor.specialtyId);
    
    return { doctor, office, specialty };
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;

    const { data, searchType, message } = searchResults;

    return (
      <div className="search-results">
        <h3>Search Results</h3>
        <p className="results-message">{message}</p>
        
        {data && data.length > 0 && (
          <div className="results-grid">
            {searchType === 'doctor' && data.map((item) => {
              const doctor = item as Schema["Doctor"]["type"];
              const { office, specialty } = getRelatedData(doctor.id);
              return (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  office={office || undefined}
                  specialty={specialty || undefined}
                />
              );
            })}
            
            {searchType === 'office' && data.map((item) => {
              const office = item as Schema["Office"]["type"];
              return <OfficeCard key={office.id} office={office} />;
            })}
            
            {searchType === 'specialty' && data.map((item) => {
              const specialty = item as Schema["Specialty"]["type"];
              return <SpecialtyCard key={specialty.id} specialty={specialty} />;
            })}
            
            {searchType === 'general' && data.map((item: unknown) => {
              const typedItem = item as { type: string; id: string; [key: string]: unknown };
              if (typedItem.type === 'doctor') {
                const doctor = item as unknown as Schema["Doctor"]["type"];
                const { office, specialty } = getRelatedData(doctor.id);
                return (
                  <DoctorCard 
                    key={`${typedItem.type}-${typedItem.id}`} 
                    doctor={doctor} 
                    office={office || undefined}
                    specialty={specialty || undefined}
                  />
                );
              } else if (typedItem.type === 'office') {
                const office = item as unknown as Schema["Office"]["type"];
                return <OfficeCard key={`${typedItem.type}-${typedItem.id}`} office={office} />;
              } else if (typedItem.type === 'specialty') {
                const specialty = item as unknown as Schema["Specialty"]["type"];
                return <SpecialtyCard key={`${typedItem.type}-${typedItem.id}`} specialty={specialty} />;
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <main className="loading">
        <h1>🏥 Doctor Directory System</h1>
        <p>Loading building directory...</p>
      </main>
    );
  }

  return (
    <main className="doctor-directory">
      <header className="app-header">
        <h1>🏥 Doctor Directory System</h1>
        <p>AI-powered directory for medical professionals in the building</p>
      </header>

      <div className="app-content">
        <div className="ai-chat-section">
          <AIAgentChat onResults={handleAIResults} />
        </div>
        
        <div className="directory-section">
          {searchResults ? (
            renderSearchResults()
          ) : (
            <div className="default-view">
              <div className="stats">
                <div className="stat-item">
                  <h3>{doctors.length}</h3>
                  <p>Doctors</p>
                </div>
                <div className="stat-item">
                  <h3>{offices.length}</h3>
                  <p>Offices</p>
                </div>
                <div className="stat-item">
                  <h3>{specialties.length}</h3>
                  <p>Specialties</p>
                </div>
              </div>
              
              <div className="welcome-message">
                <h2>Welcome to the AI Directory Assistant</h2>
                <p>Use the chat interface to search for doctors, offices, or medical specialties.</p>
                <p>The AI agent can understand natural language queries and help you find exactly what you're looking for!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
