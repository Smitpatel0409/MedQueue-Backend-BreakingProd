/**
 * Utility class for generating consistent, unique IDs across the system.
 */
export class IDGenerator {
  private static readonly CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  private static readonly DIGITSET = '0123456789';

  /**
   * Pads a number with leading zeros.
   */
  private static padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Generates a random alphanumeric string of given length.
   */
  private static generateRandomAlphanumeric(length: number): string {
    return Array.from({ length }, () =>
      this.CHARSET[Math.floor(Math.random() * this.CHARSET.length)]
    ).join('');
  }

  /**
   * Generates a random numeric string (e.g., OTPs).
   */
  public static generateRandomNumeric(length: number): string {
    return Array.from({ length }, () =>
      this.DIGITSET[Math.floor(Math.random() * this.DIGITSET.length)]
    ).join('');
  }

  /**
   * Generates a custom user ID: `USR-2025-ABC123`
   */
  public static generateUserId(role: string): string {
    const prefix = role.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const randomPart = this.generateRandomAlphanumeric(6);
    return `${prefix}-${year}-${randomPart}`;
  }

  /**
   * Generates patient ID: `GINI-2025-0001-0001`
   */
  public static generatePatientId(count: number): string {
    const year = new Date().getFullYear();
    const padded = this.padNumber(count, 8); // e.g., 123 -> 00000123
    const part1 = padded.slice(0, 4);
    const part2 = padded.slice(4);
    return `JINI-${year}-${part1}-${part2}`;
  }

  /**
   * Generates hospital ID: `HOS-IN-DL-ABC123`
   */
  public static generateHospitalId(countryCode: string, locationCode: string): string {
    const rand = this.generateRandomAlphanumeric(6);
    return `HOS-${countryCode.toUpperCase()}-${locationCode.toUpperCase()}-${rand}`;
  }

  /**
   * Generates appointment ID: `APT-PAT-ABC12345`
   */
  public static generateAppointmentId(type: string): string {
    const cleanType = type.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
    const randomPart = this.generateRandomAlphanumeric(8);
    return `APT-${cleanType}-${randomPart}`;
  }

    public static generateDepartmentId(type: string): string {
    const cleanType = type.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
    const randomPart = this.generateRandomAlphanumeric(8);
    return `DEP-${cleanType}-${randomPart}`;
  }

  /**
   * Generates prescription ID: `RX-PAT-2025-XYZ123-ABC12345`
   */
  public static generatePrescriptionId(): string {
    const year = new Date().getFullYear();
    const time = Date.now().toString(36).toUpperCase();
    const rand = this.generateRandomAlphanumeric(8);
    return `RX-${year}-${time}-${rand}`;
  }

  /**
   * Medical history ID: `EHR-2025-XYZ123-ABC12345`
   */
  public static generateMedicalHistoryId(): string {
    const year = new Date().getFullYear();
    const time = Date.now().toString(36).toUpperCase();
    const rand = this.generateRandomAlphanumeric(8);
    return `EHR-${year}-${time}-${rand}`;
  }

  /**
   * Appointment availability ID: `AVA-2025-ABC123`
   */
  public static generateAppointmentAvailabilityId(): string {
    const year = new Date().getFullYear();
    const rand = this.generateRandomAlphanumeric(6);
    return `AVA-${year}-${rand}`;
  }

  /**
   * Feedback ID: `FDB-PAT-BUG-2025-ABC123`
   */
  public static generateFeedbackId(appType: string, feedbackType: string): string {
    const year = new Date().getFullYear();
    const rand = this.generateRandomAlphanumeric(6);
    return `FDB-${appType.toUpperCase()}-${feedbackType.toUpperCase()}-${year}-${rand}`;
  }

  /**
   * Lab ID: `LAB-2025-ABC123`
   */
  public static generateLabId(): string {
    const year = new Date().getFullYear();
    const rand = this.generateRandomAlphanumeric(6);
    return `LAB-${year}-${rand}`;
  }

  /**
   * Lab Test ID: `LAB-BLOOD-2025-ABC123`
   */
  public static generateLabTestId(testType: string): string {
    const year = new Date().getFullYear();
    const rand = this.generateRandomAlphanumeric(6);
    return `LAB-${testType.toUpperCase()}-${year}-${rand}`;
  }

  /**
 * Generates a custom recording ID in format: APT-TYPE-XXXXXX
 * @param type - type (ON_SITE, AUDIO, VIDEO)
 */
  public static  generateRecordingId(type: string): string {
    const randomPart = this.generateRandomAlphanumeric(8);
    return `REC-${type}-${randomPart}`;
  }

public static generateFileId(count: number): string {
      const year = new Date().getFullYear();
      const padded = this.padNumber(count, 4); // e.g., 123 -> 0123
      return `NEURAQ-${year}-${padded}`;
    }

public static generateStateId(name: string, count: number): string {
    const prefix = 'ST';
    const padded = this.padNumber(count, 4); // e.g., 1 -> 0001
    const suffix = name.substring(0, 3).toUpperCase(); // Karnataka -> KAR
    return `${prefix}-${padded}-${suffix}`;
  }

public static generateCityId(name: string, count: number): string {
    const prefix = 'CT';
    const padded = this.padNumber(count, 4);
    const suffix = name.substring(0, 3).toUpperCase();
    return `${prefix}-${padded}-${suffix}`;
}

public static generateAnnotationId(doctorId:string):string{
  const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ANNO-${doctorId}-${timestamp}-${random}`;
}

}




