export const PERFORMANCE_CATEGORIES = {
  TEACHING_SCORE: {
    name: 'Teaching Subject Score',
    maxMarks: 320,
    formula: 'Pass Percentage × 80 / 100',
    validator: 'EXAM_CELL',
  },
  PROJECTS_GUIDED: {
    name: 'Projects Guided',
    maxMarks: 30,
    formula: '1 Project=10, 2 Projects=20, 3+=30',
    validator: 'HOD',
  },
  ADMIN_ACTIVITIES: {
    name: 'Administrative Activities',
    maxMarks: 30,
    formula: '1=10, 2=20, 3+=30',
    validator: 'HOD',
  },
  ACHIEVEMENTS: {
    name: 'Achievements & Awards',
    maxMarks: 10,
    formula: 'Only one entry considered',
    validator: 'HOD',
  },
  COUNSELLING: {
    name: 'Counselling Activities',
    maxMarks: 30,
    formula: '1=10, 2=20, 3+=30',
    validator: 'COUNSELLING_COORDINATOR',
  },
  RESEARCH: {
    name: 'Research Projects',
    maxMarks: 50,
    formula: 'Per project marks',
    validator: 'RND_COORDINATOR',
  },
  EVENTS_ATTENDED: {
    name: 'Events Attended',
    maxMarks: 30,
    formula: 'Seminar=5, Guest Lecture=5, Workshop=5, FDP=10, Conference=10 (Max 30)',
    validator: 'IQAC',
  },
  EVENTS_CONDUCTED: {
    name: 'Events Conducted',
    maxMarks: 40,
    formula: 'Seminar=5, Guest Lecture=5, Workshop=10, FDP=15, Conference=15 (Max 40)',
    validator: 'IQAC',
  },
  PAPERS_PUBLISHED: {
    name: 'Papers Published',
    maxMarks: 60,
    formula: 'Conference National=10, Conference International=30, Journal National=10, Journal International=30',
    validator: 'RND_COORDINATOR',
  },
  BOOKS_AUTHORED: {
    name: 'Books Authored',
    maxMarks: 20,
    formula: 'Partial=10, Authored=20',
    validator: 'RND_COORDINATOR',
  },
  PATENTS: {
    name: 'Patents Filed',
    maxMarks: 20,
    formula: 'Filed=5, Granted=20',
    validator: 'RND_COORDINATOR',
  },
  ARTICLES: {
    name: 'Articles Published',
    maxMarks: 10,
    formula: 'IF 1=5, IF 2+=10',
    validator: 'HOD',
  },
  STUDENT_ENRICHMENT: {
    name: 'Student Enrichment Activities',
    maxMarks: 40,
    formula: '1=10, 2=20, 3=30, 4+=40',
    validator: 'HOD',
  },
  EXTERNAL_PRESENTATIONS: {
    name: 'External Presentations',
    maxMarks: 40,
    formula: '1=10, 2=20, 3=30, 4+=40',
    validator: 'HOD',
  },
  COURSES_UNDERTAKEN: {
    name: 'Courses Undertaken',
    maxMarks: 40,
    formula: 'Per course marks',
    validator: 'HOD',
  },
  EXTRA_CURRICULAR: {
    name: 'Extra-Curricular Activities',
    maxMarks: 40,
    formula: '1=10, 2=20, 3=30, 4+=40',
    validator: 'HOD',
  },
};

export function calculateMarks(category: string, item: any): number {
  switch (category) {
    case 'TEACHING_SCORE':
      return item.score ? (item.score * 80) / 100 : 0;
    
    case 'PROJECTS_GUIDED':
      const projectCount = item.count || 1;
      if (projectCount >= 3) return 30;
      if (projectCount === 2) return 20;
      return 10;
    
    case 'ADMIN_ACTIVITIES':
      const adminCount = item.count || 1;
      if (adminCount >= 3) return 30;
      if (adminCount === 2) return 20;
      return 10;
    
    case 'ACHIEVEMENTS':
      return 10;
    
    case 'COUNSELLING':
      const counsellingCount = item.count || 1;
      if (counsellingCount >= 3) return 30;
      if (counsellingCount === 2) return 20;
      return 10;
    
    case 'RESEARCH':
      return item.marks || 0;
    
    case 'EVENTS_ATTENDED':
      let attendedMarks = 0;
      const seminars = item.seminars || 0;
      const guestLectures = item.guestLectures || 0;
      const workshops = item.workshops || 0;
      const fdp = item.fdp || 0;
      const conferences = item.conferences || 0;
      attendedMarks += seminars * 5;
      attendedMarks += guestLectures * 5;
      attendedMarks += workshops * 5;
      attendedMarks += fdp * 10;
      attendedMarks += conferences * 10;
      return Math.min(attendedMarks, 30);
    
    case 'EVENTS_CONDUCTED':
      let conductedMarks = 0;
      const cSeminars = item.seminars || 0;
      const cGuestLectures = item.guestLectures || 0;
      const cWorkshops = item.workshops || 0;
      const cFdp = item.fdp || 0;
      const cConferences = item.conferences || 0;
      conductedMarks += cSeminars * 5;
      conductedMarks += cGuestLectures * 5;
      conductedMarks += cWorkshops * 10;
      conductedMarks += cFdp * 15;
      conductedMarks += cConferences * 15;
      return Math.min(conductedMarks, 40);
    
    case 'PAPERS_PUBLISHED':
      let paperMarks = 0;
      const confNational = item.confNational || 0;
      const confInternational = item.confInternational || 0;
      const journalNational = item.journalNational || 0;
      const journalInternational = item.journalInternational || 0;
      paperMarks += confNational * 10;
      paperMarks += confInternational * 30;
      paperMarks += journalNational * 10;
      paperMarks += journalInternational * 30;
      return paperMarks;
    
    case 'BOOKS_AUTHORED':
      return item.isAuthored ? 20 : 10;
    
    case 'PATENTS':
      return item.isGranted ? 20 : 5;
    
    case 'ARTICLES':
      const ifCount = item.impactFactorCount || 1;
      return ifCount >= 2 ? 10 : 5;
    
    case 'STUDENT_ENRICHMENT':
      const enrichmentCount = item.count || 1;
      if (enrichmentCount >= 4) return 40;
      if (enrichmentCount === 3) return 30;
      if (enrichmentCount === 2) return 20;
      return 10;
    
    case 'EXTERNAL_PRESENTATIONS':
      const presCount = item.count || 1;
      if (presCount >= 4) return 40;
      if (presCount === 3) return 30;
      if (presCount === 2) return 20;
      return 10;
    
    case 'COURSES_UNDERTAKEN':
      const courseCount = item.count || 1;
      return Math.min(courseCount * 10, 40);
    
    case 'EXTRA_CURRICULAR':
      const extraCount = item.count || 1;
      if (extraCount >= 4) return 40;
      if (extraCount === 3) return 30;
      if (extraCount === 2) return 20;
      return 10;
    
    default:
      return 0;
  }
}
