import styles from './TeamSection.module.css'
import type { Barista } from '../data/locations'

type TeamSectionProps = {
  baristas: Barista[]
}

export function TeamSection({ baristas }: TeamSectionProps) {
  const sortedBaristas = [...baristas].sort((a, b) => a.name.localeCompare(b.name, 'ru'))

  return (
    <section className={styles.teamSection}>
      <div className={styles.teamHeader}>
        <h2>Команда</h2>
        <span>{baristas.length} человек</span>
      </div>

      <ul className={styles.teamList}>
        {sortedBaristas.map((barista) => {
          const highlight = barista.bonus > 0 ? styles.teamItemHighlight : ''
          return (
            <li key={barista.id} className={`${styles.teamItem} ${highlight}`.trim()}>
              <span className={styles.name}>{barista.name}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

