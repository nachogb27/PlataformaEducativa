const StudentsTeachersRelation = require('./models/students_teachers_relation.model'); // RUTA CORREGIDA

// Función para crear relación
async function createRelation() {
  try {
    const relation = await StudentsTeachersRelation.create({
      id_student: 2,  
      id_teacher: 3, 
      id_subject: 3  
    });
    
    console.log('Relación creada con éxito:', relation.toJSON());
  } catch (error) {
    console.error('Error al crear la relación:', error);
  }
}

// Función para obtener estudiantes de un profesor
async function getStudentsByTeacher(teacherId) {
  try {
    const relations = await StudentsTeachersRelation.getStudentsByTeacher(teacherId);
    console.log(`Estudiantes del profesor ${teacherId}:`, relations.map(r => r.toJSON()));
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
  }
}

// Función para obtener profesores de un estudiante
async function getTeachersByStudent(studentId) {
  try {
    const relations = await StudentsTeachersRelation.getTeachersByStudent(studentId);
    console.log(`Profesores del estudiante ${studentId}:`, relations.map(r => r.toJSON()));
  } catch (error) {
    console.error('Error al obtener profesores:', error);
  }
}

createRelation();
//getStudentsByTeacher(2);
//getTeachersByStudent(1);