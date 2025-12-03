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
        {sortedBaristas.map((barista) => (
          <li key={barista.id} className={styles.teamItem}>
            <span className={styles.name}>{barista.name}</span>
            {barista.bonus > 0 && (
              <span className={styles.bonus}>+ {barista.bonus.toLocaleString('ru-RU')} ₽</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

