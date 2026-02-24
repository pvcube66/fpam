const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Clear all data
    await prisma.notification.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.examResult.deleteMany();
    await prisma.teachingScore.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.department.deleteMany();
    await prisma.role.deleteMany();

    const hash = await bcrypt.hash('password123', 10);

    // Create roles
    const roles = [
        { roleName: 'SUPER_ADMIN', permissions: JSON.stringify(['*']) },
        { roleName: 'PRINCIPAL', permissions: JSON.stringify(['view_all', 'approve_final', 'download_reports', 'manage_departments']) },
        { roleName: 'HOD', permissions: JSON.stringify(['view_department', 'validate_submissions', 'assign_marks', 'download_reports']) },
        { roleName: 'IQAC', permissions: JSON.stringify(['view_all', 'export_reports', 'view_analytics']) },
        { roleName: 'EXAM_CELL', permissions: JSON.stringify(['upload_results', 'verify_results', 'view_results']) },
        { roleName: 'FACULTY', permissions: JSON.stringify(['submit_activities', 'view_own', 'edit_profile']) },
        { roleName: 'STUDENT', permissions: JSON.stringify(['submit_feedback', 'view_own']) },
    ];
    for (const role of roles) {
        await prisma.role.create({ data: role });
    }

    // Create departments
    const cse = await prisma.department.create({ data: { name: 'Computer Science & Engineering', code: 'CSE' } });
    const ece = await prisma.department.create({ data: { name: 'Electronics & Communication', code: 'ECE' } });
    const mech = await prisma.department.create({ data: { name: 'Mechanical Engineering', code: 'MECH' } });
    const civil = await prisma.department.create({ data: { name: 'Civil Engineering', code: 'CIVIL' } });

    // Create subjects
    const sub1 = await prisma.subject.create({ data: { name: 'Data Structures', code: 'CS201', departmentId: cse.id } });
    const sub2 = await prisma.subject.create({ data: { name: 'Database Systems', code: 'CS301', departmentId: cse.id } });
    const sub3 = await prisma.subject.create({ data: { name: 'Machine Learning', code: 'CS401', departmentId: cse.id } });
    const sub4 = await prisma.subject.create({ data: { name: 'Digital Electronics', code: 'EC201', departmentId: ece.id } });
    const sub5 = await prisma.subject.create({ data: { name: 'VLSI Design', code: 'EC301', departmentId: ece.id } });
    const sub6 = await prisma.subject.create({ data: { name: 'Thermodynamics', code: 'ME201', departmentId: mech.id } });
    const sub7 = await prisma.subject.create({ data: { name: 'Structural Analysis', code: 'CE201', departmentId: civil.id } });

    // Create Super Admin
    const admin = await prisma.user.create({
        data: { email: 'admin@fpams.edu', password: hash, name: 'System Administrator', role: 'SUPER_ADMIN', employeeId: 'ADM001', designation: 'System Administrator', status: 'ACTIVE' },
    });

    // Create users
    const faculty1 = await prisma.user.create({
        data: { email: 'faculty1@fpams.edu', password: hash, name: 'Dr. Ananya Sharma', role: 'FACULTY', departmentId: cse.id, employeeId: 'FAC001', designation: 'Associate Professor', phone: '9876543210', joiningDate: new Date('2015-06-15'), status: 'ACTIVE' },
    });
    const faculty2 = await prisma.user.create({
        data: { email: 'faculty2@fpams.edu', password: hash, name: 'Dr. Rajesh Kumar', role: 'FACULTY', departmentId: cse.id, employeeId: 'FAC002', designation: 'Assistant Professor', phone: '9876543211', joiningDate: new Date('2018-01-10'), status: 'ACTIVE' },
    });
    const faculty3 = await prisma.user.create({
        data: { email: 'faculty3@fpams.edu', password: hash, name: 'Dr. Priya Patel', role: 'FACULTY', departmentId: ece.id, employeeId: 'FAC003', designation: 'Professor', phone: '9876543212', joiningDate: new Date('2010-08-20'), status: 'ACTIVE' },
    });
    const faculty4 = await prisma.user.create({
        data: { email: 'faculty4@fpams.edu', password: hash, name: 'Dr. Vikram Singh', role: 'FACULTY', departmentId: mech.id, employeeId: 'FAC004', designation: 'Assistant Professor', phone: '9876543213', joiningDate: new Date('2020-03-01'), status: 'ACTIVE' },
    });

    const hod = await prisma.user.create({
        data: { email: 'hod@fpams.edu', password: hash, name: 'Dr. Sunita Verma', role: 'HOD', departmentId: cse.id, employeeId: 'HOD001', designation: 'Head of Department', phone: '9876543220', joiningDate: new Date('2008-07-01'), status: 'ACTIVE' },
    });

    const principal = await prisma.user.create({
        data: { email: 'principal@fpams.edu', password: hash, name: 'Dr. M.K. Jain', role: 'PRINCIPAL', employeeId: 'PRI001', designation: 'Principal', phone: '9876543230', joiningDate: new Date('2005-01-15'), status: 'ACTIVE' },
    });

    const iqac = await prisma.user.create({
        data: { email: 'iqac@fpams.edu', password: hash, name: 'Dr. Ramesh Gupta', role: 'IQAC', employeeId: 'IQAC001', designation: 'IQAC Coordinator', phone: '9876543240', joiningDate: new Date('2012-04-10'), status: 'ACTIVE' },
    });

    const examCell = await prisma.user.create({
        data: { email: 'exam@fpams.edu', password: hash, name: 'Prof. Kavita Mehta', role: 'EXAM_CELL', employeeId: 'EXM001', designation: 'Examination Controller', phone: '9876543250', joiningDate: new Date('2014-09-01'), status: 'ACTIVE' },
    });

    const student1 = await prisma.user.create({
        data: { email: 'student1@fpams.edu', password: hash, name: 'Arjun Reddy', role: 'STUDENT', departmentId: cse.id, employeeId: 'STU001', status: 'ACTIVE' },
    });
    const student2 = await prisma.user.create({
        data: { email: 'student2@fpams.edu', password: hash, name: 'Sneha Iyer', role: 'STUDENT', departmentId: cse.id, employeeId: 'STU002', status: 'ACTIVE' },
    });

    // Teaching scores
    const teachingData = [
        { facultyId: faculty1.id, subjectId: sub1.id, academicYear: '2024-25', score: 85, status: 'APPROVED', marks: 9 },
        { facultyId: faculty1.id, subjectId: sub2.id, academicYear: '2024-25', score: 78, status: 'APPROVED', marks: 8 },
        { facultyId: faculty1.id, subjectId: sub3.id, academicYear: '2023-24', score: 90, status: 'APPROVED', marks: 9.5 },
        { facultyId: faculty2.id, subjectId: sub1.id, academicYear: '2024-25', score: 72, status: 'UNDER_REVIEW', marks: null },
        { facultyId: faculty2.id, subjectId: sub2.id, academicYear: '2023-24', score: 80, status: 'APPROVED', marks: 8.5 },
        { facultyId: faculty3.id, subjectId: sub4.id, academicYear: '2024-25', score: 88, status: 'PENDING', marks: null },
        { facultyId: faculty4.id, subjectId: sub6.id, academicYear: '2024-25', score: 75, status: 'APPROVED', marks: 7.5 },
    ];
    for (const ts of teachingData) {
        await prisma.teachingScore.create({ data: ts });
    }

    // Activities
    const activityData = [
        { facultyId: faculty1.id, category: 'PAPERS_PUBLISHED', title: 'Deep Learning in Healthcare', description: 'IEEE Conference paper on DL applications in healthcare diagnostics', academicYear: '2024-25', status: 'APPROVED', marks: 10 },
        { facultyId: faculty1.id, category: 'RESEARCH', title: 'AI-powered Crop Disease Detection', description: 'Funded research project on using computer vision for agriculture', academicYear: '2024-25', status: 'APPROVED', marks: 9 },
        { facultyId: faculty1.id, category: 'PROJECTS_GUIDED', title: 'Student IoT Project', description: 'Guided 4 students in developing IoT-based smart campus system', academicYear: '2024-25', status: 'APPROVED', marks: 8 },
        { facultyId: faculty1.id, category: 'EVENTS_CONDUCTED', title: 'National Workshop on ML', description: 'Organized 3-day workshop on Machine Learning for faculty development', academicYear: '2024-25', status: 'UNDER_REVIEW', marks: null },
        { facultyId: faculty1.id, category: 'ACHIEVEMENTS', title: 'Best Researcher Award', description: 'Received university-level best researcher award 2024', academicYear: '2024-25', status: 'APPROVED', marks: 10 },
        { facultyId: faculty2.id, category: 'PAPERS_PUBLISHED', title: 'Blockchain in Supply Chain', description: 'Springer journal paper on blockchain applications', academicYear: '2024-25', status: 'PENDING', marks: null },
        { facultyId: faculty2.id, category: 'ADMIN_ACTIVITIES', title: 'Exam Controller', description: 'Served as exam controller for university examinations', academicYear: '2024-25', status: 'APPROVED', marks: 7 },
        { facultyId: faculty2.id, category: 'COURSES_UNDERTAKEN', title: 'NPTEL Cloud Computing', description: 'Completed NPTEL certification in Cloud Computing', academicYear: '2023-24', status: 'APPROVED', marks: 8 },
        { facultyId: faculty3.id, category: 'PATENTS', title: 'Smart Antenna Design', description: 'Filed patent for novel smart antenna design', academicYear: '2024-25', status: 'APPROVED', marks: 10 },
        { facultyId: faculty3.id, category: 'BOOKS_AUTHORED', title: 'Digital Electronics Fundamentals', description: 'Authored textbook published by Pearson Education', academicYear: '2023-24', status: 'APPROVED', marks: 9 },
        { facultyId: faculty3.id, category: 'EXTERNAL_PRESENTATIONS', title: 'IEEE Symposium Talk', description: 'Invited talk at IEEE International Symposium', academicYear: '2024-25', status: 'PENDING', marks: null },
        { facultyId: faculty4.id, category: 'STUDENT_ENRICHMENT', title: 'Industry Visit Organization', description: 'Organized visit to Tata Motors for 60 students', academicYear: '2024-25', status: 'APPROVED', marks: 7 },
        { facultyId: faculty4.id, category: 'COUNSELLING', title: 'Student Mentoring Program', description: 'Mentored 25 students under department counselling program', academicYear: '2024-25', status: 'APPROVED', marks: 8 },
        { facultyId: faculty4.id, category: 'EXTRA_CURRICULAR', title: 'Sports Committee Head', description: 'Led university sports committee and organized annual sports fest', academicYear: '2024-25', status: 'UNDER_REVIEW', marks: null },
    ];
    for (const act of activityData) {
        await prisma.activity.create({ data: act });
    }

    // Feedback
    const feedbackData = [
        { studentId: student1.id, facultyId: faculty1.id, subjectId: sub1.id, rating: 5, comment: 'Excellent teaching methodology', isAnonymous: false },
        { studentId: student1.id, facultyId: faculty2.id, subjectId: sub2.id, rating: 4, comment: 'Good but can improve pace', isAnonymous: true },
        { studentId: student2.id, facultyId: faculty1.id, subjectId: sub3.id, rating: 5, comment: 'Best professor for ML', isAnonymous: false },
        { studentId: student2.id, facultyId: faculty2.id, subjectId: sub1.id, rating: 3, comment: 'Average delivery', isAnonymous: true },
        { studentId: student1.id, facultyId: faculty3.id, subjectId: sub4.id, rating: 4, comment: 'Very thorough and practical', isAnonymous: false },
    ];
    for (const fb of feedbackData) {
        await prisma.feedback.create({ data: fb });
    }

    // Exam Results
    await prisma.examResult.create({
        data: { subjectId: sub1.id, uploadedById: examCell.id, academicYear: '2024-25', passPercentage: 85.5, averageScore: 68.2, totalStudents: 120, verified: true },
    });
    await prisma.examResult.create({
        data: { subjectId: sub2.id, uploadedById: examCell.id, academicYear: '2024-25', passPercentage: 78.3, averageScore: 62.1, totalStudents: 95, verified: true },
    });
    await prisma.examResult.create({
        data: { subjectId: sub4.id, uploadedById: examCell.id, academicYear: '2024-25', passPercentage: 90.0, averageScore: 72.5, totalStudents: 80, verified: false },
    });

    // Notifications
    await prisma.notification.create({
        data: { userId: faculty1.id, title: 'Activity Approved', message: 'Your activity "Deep Learning in Healthcare" has been approved with 10 marks.' },
    });
    await prisma.notification.create({
        data: { userId: faculty1.id, title: 'Teaching Score Approved', message: 'Your teaching score for Data Structures (85%) has been approved.', read: true },
    });
    await prisma.notification.create({
        data: { userId: faculty2.id, title: 'Submission Pending', message: 'Your paper "Blockchain in Supply Chain" is pending review by HOD.' },
    });

    console.log('✅ Seed data created successfully!');
    console.log('');
    console.log('📋 Login Credentials (all passwords: password123):');
    console.log('  Super Admin: admin@fpams.edu');
    console.log('  Faculty:     faculty1@fpams.edu, faculty2@fpams.edu, faculty3@fpams.edu, faculty4@fpams.edu');
    console.log('  HOD:         hod@fpams.edu');
    console.log('  Principal:   principal@fpams.edu');
    console.log('  IQAC:        iqac@fpams.edu');
    console.log('  Exam Cell:   exam@fpams.edu');
    console.log('  Student:     student1@fpams.edu, student2@fpams.edu');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
