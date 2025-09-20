import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export interface AIAgentResponse {
  success: boolean;
  data?: unknown[];
  message: string;
  searchType: "doctor" | "specialty" | "office" | "general";
}

export class DoctorDirectoryAI {
  static async processQuery(query: string): Promise<AIAgentResponse> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Save the query to the database for tracking
    await client.models.DirectoryQuery.create({
      query: query,
      searchType: this.determineSearchType(normalizedQuery),
      timestamp: new Date().getTime(),
    });

    // Determine the type of search based on keywords
    if (this.containsDoctorKeywords(normalizedQuery)) {
      return await this.searchDoctors(normalizedQuery);
    } else if (this.containsOfficeKeywords(normalizedQuery)) {
      return await this.searchOffices(normalizedQuery);
    } else if (this.containsSpecialtyKeywords(normalizedQuery)) {
      return await this.searchSpecialties(normalizedQuery);
    } else {
      return await this.generalSearch(normalizedQuery);
    }
  }

  private static determineSearchType(query: string): "doctor" | "specialty" | "office" | "general" {
    if (this.containsDoctorKeywords(query)) return "doctor";
    if (this.containsOfficeKeywords(query)) return "office";
    if (this.containsSpecialtyKeywords(query)) return "specialty";
    return "general";
  }

  private static containsDoctorKeywords(query: string): boolean {
    const keywords = ["doctor", "dr", "physician", "find doctor", "available doctor", "appointment"];
    return keywords.some(keyword => query.includes(keyword));
  }

  private static containsOfficeKeywords(query: string): boolean {
    const keywords = ["office", "room", "floor", "building", "location", "where is", "find office"];
    return keywords.some(keyword => query.includes(keyword));
  }

  private static containsSpecialtyKeywords(query: string): boolean {
    const keywords = ["specialty", "department", "cardiology", "dermatology", "pediatrics", "orthopedics"];
    return keywords.some(keyword => query.includes(keyword));
  }

  private static async searchDoctors(query: string): Promise<AIAgentResponse> {
    try {
      const { data: doctors } = await client.models.Doctor.list();
      
      let filteredDoctors = doctors;

      // Filter by availability if requested
      if (query.includes("available")) {
        filteredDoctors = doctors.filter(doctor => doctor.isAvailable);
      }

      // Search by name
      const nameMatch = query.match(/(?:doctor|dr\.?)\s+([a-zA-Z]+)/i);
      if (nameMatch) {
        const searchName = nameMatch[1].toLowerCase();
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.firstName?.toLowerCase().includes(searchName) ||
          doctor.lastName?.toLowerCase().includes(searchName)
        );
      }

      return {
        success: true,
        data: filteredDoctors,
        message: filteredDoctors.length > 0 
          ? `Found ${filteredDoctors.length} doctor(s) matching your search.`
          : "No doctors found matching your criteria.",
        searchType: "doctor"
      };
    } catch (error) {
      return {
        success: false,
        message: "Error searching for doctors. Please try again.",
        searchType: "doctor"
      };
    }
  }

  private static async searchOffices(query: string): Promise<AIAgentResponse> {
    try {
      const { data: offices } = await client.models.Office.list();
      
      let filteredOffices = offices;

      // Search by room number
      const roomMatch = query.match(/room\s+(\w+)/i);
      if (roomMatch) {
        const roomNumber = roomMatch[1];
        filteredOffices = offices.filter(office => 
          office.roomNumber?.toLowerCase().includes(roomNumber.toLowerCase())
        );
      }

      // Search by floor
      const floorMatch = query.match(/floor\s+(\d+)/i);
      if (floorMatch) {
        const floor = parseInt(floorMatch[1]);
        filteredOffices = filteredOffices.filter(office => office.floor === floor);
      }

      return {
        success: true,
        data: filteredOffices,
        message: filteredOffices.length > 0 
          ? `Found ${filteredOffices.length} office(s) matching your search.`
          : "No offices found matching your criteria.",
        searchType: "office"
      };
    } catch (error) {
      return {
        success: false,
        message: "Error searching for offices. Please try again.",
        searchType: "office"
      };
    }
  }

  private static async searchSpecialties(query: string): Promise<AIAgentResponse> {
    try {
      const { data: specialties } = await client.models.Specialty.list();
      
      const filteredSpecialties = specialties.filter(specialty =>
        specialty.name?.toLowerCase().includes(query) ||
        specialty.department?.toLowerCase().includes(query)
      );

      return {
        success: true,
        data: filteredSpecialties,
        message: filteredSpecialties.length > 0 
          ? `Found ${filteredSpecialties.length} specialty(ies) matching your search.`
          : "No specialties found matching your criteria.",
        searchType: "specialty"
      };
    } catch (error) {
      return {
        success: false,
        message: "Error searching for specialties. Please try again.",
        searchType: "specialty"
      };
    }
  }

  private static async generalSearch(query: string): Promise<AIAgentResponse> {
    try {
      // Perform a general search across all entities
      const [doctorsResult, officesResult, specialtiesResult] = await Promise.all([
        client.models.Doctor.list(),
        client.models.Office.list(),
        client.models.Specialty.list()
      ]);

      const allResults = [
        ...(doctorsResult.data || []).map(item => ({ ...item, type: 'doctor' })),
        ...(officesResult.data || []).map(item => ({ ...item, type: 'office' })),
        ...(specialtiesResult.data || []).map(item => ({ ...item, type: 'specialty' }))
      ];

      // Simple text matching across all fields
      const filteredResults = allResults.filter(item => {
        const searchableText = Object.values(item).join(' ').toLowerCase();
        return searchableText.includes(query);
      });

      return {
        success: true,
        data: filteredResults,
        message: filteredResults.length > 0 
          ? `Found ${filteredResults.length} result(s) in the directory.`
          : "No results found. Try asking about doctors, offices, or medical specialties.",
        searchType: "general"
      };
    } catch (error) {
      return {
        success: false,
        message: "Error performing search. Please try again.",
        searchType: "general"
      };
    }
  }

  static generateHelpfulResponse(): string {
    const responses = [
      "You can ask me about:",
      "• Finding doctors by name or specialty",
      "• Locating office rooms and floors",
      "• Getting information about medical departments",
      "• Checking doctor availability",
      "",
      "Try asking: 'Find Dr. Smith', 'Where is room 205?', or 'Show available doctors'"
    ];
    
    return responses.join('\n');
  }
}