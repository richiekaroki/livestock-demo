import { Injectable, Logger } from '@nestjs/common';

export interface HealthAssessmentResult {
  id: string;
  animalType: string;
  imageUrl: string;
  healthStatus: 'healthy' | 'sick' | 'under_treatment' | 'needs_attention';
  confidence: number;
  findings: {
    category: string;
    status: 'normal' | 'abnormal' | 'warning';
    description: string;
    confidence: number;
  }[];
  recommendations: string[];
  assessedAt: string;
  model: string;
}

@Injectable()
export class HealthAssessmentService {
  private readonly logger = new Logger(HealthAssessmentService.name);

  async assessHealth(data: {
    imageUrl: string;
    animalType: string;
    animalName?: string;
    notes?: string;
  }): Promise<HealthAssessmentResult> {
    this.logger.log(
      `Assessing health for ${data.animalType}${data.animalName ? ` (${data.animalName})` : ''}`,
    );

    // Mock AI analysis — in production, call Azure Computer Vision / Google Cloud Vision
    // This simulates realistic output for demo purposes
    const result = this.generateMockAssessment(data);

    this.logger.log(
      `Assessment complete: ${result.healthStatus} (${Math.round(result.confidence * 100)}% confidence)`,
    );

    return result;
  }

  private generateMockAssessment(data: {
    imageUrl: string;
    animalType: string;
    animalName?: string;
    notes?: string;
  }): HealthAssessmentResult {
    const now = new Date().toISOString();
    const id = `ha_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Simulate different outcomes based on animal type
    const healthChances = this.getHealthChances(data.animalType);
    const status = this.pickWeighted(healthChances);

    const findings = this.generateFindings(data.animalType, status);
    const recommendations = this.generateRecommendations(status, data.animalType);

    return {
      id,
      animalType: data.animalType,
      imageUrl: data.imageUrl,
      healthStatus: status,
      confidence: 0.65 + Math.random() * 0.3, // 65–95%
      findings,
      recommendations,
      assessedAt: now,
      model: 'mock-v1 (demo — swap Azure Computer Vision for production)',
    };
  }

  private getHealthChances(animalType: string) {
    // Different animals have different base health distributions
    const chances: Record<string, Record<string, number>> = {
      Cattle: { healthy: 0.6, sick: 0.15, under_treatment: 0.1, needs_attention: 0.15 },
      Goat: { healthy: 0.55, sick: 0.2, under_treatment: 0.1, needs_attention: 0.15 },
      Sheep: { healthy: 0.55, sick: 0.2, under_treatment: 0.1, needs_attention: 0.15 },
      Camel: { healthy: 0.7, sick: 0.1, under_treatment: 0.05, needs_attention: 0.15 },
      Pig: { healthy: 0.5, sick: 0.25, under_treatment: 0.1, needs_attention: 0.15 },
      Chicken: { healthy: 0.5, sick: 0.25, under_treatment: 0.1, needs_attention: 0.15 },
    };
    return chances[animalType] || chances.Cattle;
  }

  private pickWeighted(chances: Record<string, number>): 'healthy' | 'sick' | 'under_treatment' | 'needs_attention' {
    const rand = Math.random();
    let cumulative = 0;
    for (const [status, weight] of Object.entries(chances)) {
      cumulative += weight;
      if (rand <= cumulative) return status as any;
    }
    return 'healthy';
  }

  private generateFindings(
    animalType: string,
    status: string,
  ): HealthAssessmentResult['findings'] {
    const findings: HealthAssessmentResult['findings'] = [];

    // Body condition
    findings.push({
      category: 'Body Condition',
      status: status === 'healthy' ? 'normal' : 'warning',
      description: status === 'healthy'
        ? `Adequate body condition score for ${animalType.toLowerCase()}`
        : `Body condition below optimal — may indicate nutritional deficiency`,
      confidence: 0.7 + Math.random() * 0.25,
    });

    // Coat/skin
    findings.push({
      category: 'Coat/Skin',
      status: status === 'sick' ? 'abnormal' : 'normal',
      description: status === 'sick'
        ? 'Coat appears dull, possible signs of parasite load or infection'
        : 'Coat appears glossy and healthy',
      confidence: 0.65 + Math.random() * 0.3,
    });

    // Eyes
    findings.push({
      category: 'Eye Appearance',
      status: status === 'needs_attention' ? 'warning' : 'normal',
      description: status === 'needs_attention'
        ? 'Slight discharge or cloudiness observed — monitor closely'
        : 'Eyes clear and bright',
      confidence: 0.7 + Math.random() * 0.2,
    });

    // Posture
    if (status === 'sick' || status === 'under_treatment') {
      findings.push({
        category: 'Posture/Gait',
        status: 'abnormal',
        description: 'Slight head droop or reduced mobility — possible lameness or illness',
        confidence: 0.6 + Math.random() * 0.25,
      });
    } else {
      findings.push({
        category: 'Posture/Gait',
        status: 'normal',
        description: 'Normal standing posture and gait',
        confidence: 0.75 + Math.random() * 0.2,
      });
    }

    return findings;
  }

  private generateRecommendations(
    status: string,
    animalType: string,
  ): string[] {
    const recommendations: string[] = [];

    if (status === 'healthy') {
      recommendations.push('Continue current management practices');
      recommendations.push('Schedule routine vaccination if not up to date');
      recommendations.push('Monitor monthly weight gain');
    } else if (status === 'needs_attention') {
      recommendations.push('Monitor animal closely for 48–72 hours');
      recommendations.push('Check temperature and appetite daily');
      recommendations.push('Consult field agent if symptoms persist');
      recommendations.push('Isolate from herd if contagious disease suspected');
    } else if (status === 'sick') {
      recommendations.push('Isolate animal from herd immediately');
      recommendations.push('Contact veterinarian for examination');
      recommendations.push('Take temperature and record symptoms');
      recommendations.push('Report to county health office if notifiable disease suspected');
    } else if (status === 'under_treatment') {
      recommendations.push('Continue prescribed treatment course');
      recommendations.push('Monitor response to treatment daily');
      recommendations.push('Schedule follow-up veterinary visit');
      recommendations.push('Update vaccination record after recovery');
    }

    // Add animal-type specific advice
    if (animalType === 'Cattle') {
      recommendations.push('Check for ticks and deworm if due');
    } else if (animalType === 'Goat' || animalType === 'Sheep') {
      recommendations.push('Check for foot rot and deworming schedule');
    } else if (animalType === 'Chicken') {
      recommendations.push('Check for respiratory symptoms and flock behavior');
    }

    return recommendations;
  }
}
