import { LocationSection } from './components/LocationSection'
import { TeamSection } from './components/TeamSection'
import styles from './App.module.css'
import { baristas, locations } from './data/locations'

function App() {
  const locationCount = locations.length
  const teamSize = baristas.length

  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Подсчет зарплат бариста по точкам</h1>
          <div className={styles.heroStats}>
            <div>
              <span>Точки</span>
              <strong>{locationCount}</strong>
            </div>
            <div>
              <span>Команда</span>
              <strong>{teamSize}</strong>
            </div>
          </div>
        </header>

        <TeamSection baristas={baristas} />

        <section className={styles.locationsGrid}>
          {locations.map((location) => (
            <LocationSection key={location.id} location={location} />
          ))}
        </section>
      </div>
    </div>
  )
}

export default App
