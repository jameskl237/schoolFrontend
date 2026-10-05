import type { Bulletin } from '../types'

interface BulletinSheetProps {
  bulletin: Bulletin
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const note = (value: number | null) => (value === null ? '—' : value.toFixed(2).replace('.', ','))

/** L'appréciation officielle qui accompagne une moyenne sur 20. */
const appreciationFor = (average: number | null): string => {
  if (average === null) return ''
  if (average >= 18) return 'Excellent'
  if (average >= 16) return 'Très bien'
  if (average >= 14) return 'Bien'
  if (average >= 12) return 'Assez bien'
  if (average >= 10) return 'Passable'
  if (average >= 8) return 'Insuffisant'
  return 'Très faible'
}

/**
 * Bulletin au format officiel camerounais : en-tête bilingue de la République,
 * identité de l'élève, relevé par matière, statistiques de la classe, puis les
 * zones réservées aux cachets et aux signatures.
 *
 * Dimensionné pour une page A4 : les styles d'impression vivent dans la feuille
 * `bulletin-print.css`, chargée par la page d'impression.
 */
export function BulletinSheet({ bulletin }: BulletinSheetProps) {
  const { establishment, student, totals, classStats, absences } = bulletin

  return (
    <article className="bulletin">
      <header className="bulletin__header">
        <div className="bulletin__state">
          <p className="bulletin__state-title">RÉPUBLIQUE DU CAMEROUN</p>
          <p className="bulletin__state-motto">Paix – Travail – Patrie</p>
          <p className="bulletin__state-ministry">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</p>
          <p className="bulletin__school">{establishment.name}</p>
          <p className="bulletin__school-contact">
            {[establishment.poBox && `BP ${establishment.poBox}`, establishment.city, establishment.phone]
              .filter(Boolean)
              .join(' — ') || `Code : ${establishment.code}`}
          </p>
        </div>

        <div className="bulletin__logo" aria-label="Logo de l'établissement">
          {establishment.logoUrl ? (
            <img src={establishment.logoUrl} alt={`Logo de ${establishment.name}`} />
          ) : (
            <span>LOGO</span>
          )}
        </div>

        <div className="bulletin__state bulletin__state--en">
          <p className="bulletin__state-title">REPUBLIC OF CAMEROON</p>
          <p className="bulletin__state-motto">Peace – Work – Fatherland</p>
          <p className="bulletin__state-ministry">MINISTRY OF SECONDARY EDUCATION</p>
          <p className="bulletin__school-contact">Année scolaire {bulletin.academicYear}</p>
        </div>
      </header>

      <h1 className="bulletin__title">
        BULLETIN DE NOTES — {bulletin.period.name.toUpperCase()}
      </h1>

      <section className="bulletin__identity">
        <dl className="bulletin__identity-fields">
          <div>
            <dt>Nom et prénom</dt>
            <dd>
              {student.lastName.toUpperCase()} {student.firstName}
            </dd>
          </div>
          <div>
            <dt>Matricule</dt>
            <dd>{student.studentNumber}</dd>
          </div>
          <div>
            <dt>Né(e) le</dt>
            <dd>
              {dateFormatter.format(new Date(student.dateOfBirth))}
              {student.placeOfBirth ? ` à ${student.placeOfBirth}` : ''}
            </dd>
          </div>
          <div>
            <dt>Sexe</dt>
            <dd>{student.gender === 'MALE' ? 'M' : 'F'}</dd>
          </div>
          <div>
            <dt>Classe</dt>
            <dd>{bulletin.className}</dd>
          </div>
          <div>
            <dt>Effectif</dt>
            <dd>{classStats.size}</dd>
          </div>
          <div>
            <dt>Redoublant(e)</dt>
            <dd>{student.repeating ? 'Oui' : 'Non'}</dd>
          </div>
          <div>
            <dt>Professeur principal</dt>
            <dd>{bulletin.headTeacher ?? '—'}</dd>
          </div>
        </dl>

        <div className="bulletin__photo" aria-label="Photo de l'élève">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} />
          ) : (
            <span>PHOTO</span>
          )}
        </div>
      </section>

      <table className="bulletin__grades">
        <thead>
          <tr>
            <th className="is-left">Matière</th>
            <th>Moy. /20</th>
            <th>Coef.</th>
            <th>Total</th>
            <th>Rang</th>
            <th className="is-left">Appréciation</th>
            <th className="is-left">Enseignant</th>
          </tr>
        </thead>
        <tbody>
          {bulletin.lines.map((line) => (
            <tr key={line.subjectId}>
              <td className="is-left">{line.subject}</td>
              <td>{note(line.average)}</td>
              <td>{line.coefficient}</td>
              <td>{note(line.total)}</td>
              <td>{line.rank ?? '—'}</td>
              <td className="is-left">{line.teacherComment ?? appreciationFor(line.average)}</td>
              <td className="is-left">{line.teacherName ?? '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th className="is-left">Totaux</th>
            <th />
            <th>{totals.coefficients}</th>
            <th>{note(totals.points)}</th>
            <th colSpan={3} className="is-left">
              Moyenne générale : <strong>{note(totals.average)}/20</strong>
              {totals.rank !== null && ` — Rang : ${totals.rank}ᵉ/${classStats.size}`}
            </th>
          </tr>
        </tfoot>
      </table>

      <section className="bulletin__summary">
        <div className="bulletin__box">
          <h2>Statistiques de la classe</h2>
          <p>Moyenne de la classe : {note(classStats.average)}/20</p>
          <p>Plus forte moyenne : {note(classStats.highestAverage)}/20</p>
          <p>Plus faible moyenne : {note(classStats.lowestAverage)}/20</p>
        </div>

        <div className="bulletin__box">
          <h2>Discipline et assiduité</h2>
          <p>Absences : {absences.count} — dont justifiées : {absences.justified}</p>
          <p>Retards : {absences.late}</p>
          <p>Conduite : {bulletin.conduct ?? '—'}</p>
        </div>
      </section>

      <section className="bulletin__box bulletin__appreciation">
        <h2>Appréciation du conseil de classe</h2>
        <p>{bulletin.appreciation ?? ''}</p>
      </section>

      <footer className="bulletin__signatures">
        <div className="bulletin__signature">
          <p className="bulletin__signature-role">Le Professeur Principal</p>
          <p className="bulletin__signature-hint">Cachet et signature</p>
        </div>
        <div className="bulletin__signature">
          <p className="bulletin__signature-role">Les Parents</p>
          <p className="bulletin__signature-hint">Signature</p>
        </div>
        <div className="bulletin__signature">
          <p className="bulletin__signature-role">Le Chef d&rsquo;Établissement</p>
          <p className="bulletin__signature-hint">Cachet et signature</p>
        </div>
      </footer>
    </article>
  )
}
