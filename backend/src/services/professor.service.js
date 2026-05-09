import { ProfessorDAO } from "../dao/professor.dao.js";
import { getCurrentSemesterKey } from "../utils/semester.js";

export async function creditSemesterCoinsIfNeeded(professorUsuarioId) {
  const professor = await ProfessorDAO.findByUsuarioId(professorUsuarioId);
  if (!professor) return null;
  const currentSemester = getCurrentSemesterKey();
  if (professor.ultimoSemestreCredito === currentSemester) return professor;

  return ProfessorDAO.updateById(professor.id, {
      saldoMoedas: { increment: 1000 },
      ultimoSemestreCredito: currentSemester,
  });
}
