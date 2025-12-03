import { LocationSection } from './components/LocationSection'
import styles from './App.module.css'
import { locations, SENIOR_BONUS } from './data/locations'

function App() {
  const locationCount = locations.length
  const teamSize = locations.reduce((sum, location) => sum + location.baristas.length, 0)
  const seniorCount = locations.reduce(
    (sum, location) => sum + location.baristas.filter((barista) => barista.role === 'senior').length,
    0,
  )
  const totalRate = locations.reduce(
    (sum, location) => sum + location.baristas.reduce((acc, barista) => acc + barista.rate, 0),
    0,
  )
  const averageRate = teamSize > 0 ? Math.round(totalRate / teamSize) : 0

  return (
    <div className={styles.app}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.badge}>Salary dashboard · Google Sheets</p>
            <h1>Подсчет зарплат бариста по точкам</h1>
            <p className={styles.heroDescription}>
              Обнови JSON со ставками, выбери таб Google Sheets и нажми «Считать». Пока мы выводим данные в консоль,
              этого достаточно, чтобы проверить цифры перед выплатами.
            </p>
            <div className={styles.heroStats}>
              <div>
                <span>Точки</span>
                <strong>{locationCount}</strong>
              </div>
              <div>
                <span>Команда</span>
                <strong>{teamSize}</strong>
              </div>
              <div>
                <span>Старшие</span>
                <strong>{seniorCount}</strong>
              </div>
            </div>
          </div>

          <div className={styles.heroCard}>
            <p className={styles.heroCardLabel}>Средняя ставка по сети</p>
            <strong className={styles.heroCardRate}>{averageRate.toLocaleString('ru-RU')} ₽</strong>
            <div className={styles.heroCardMeta}>
              <span>Бонус старшего</span>
              <span>{SENIOR_BONUS.toLocaleString('ru-RU')} ₽</span>
            </div>
            <p className={styles.heroCardHint}>
              Бонус автоматически применяется к тем бариста, кто отмечен как «старший». Таких сотрудников сейчас три.
            </p>
          </div>
        </header>

        <section className={styles.helperPanel}>
          <article>
            <h3>Как обновлять информацию</h3>
            <ol>
              <li>Обнови JSON с бариста и ставками по каждой точке.</li>
              <li>В секции точки укажи таб Google Sheets и диапазон колонок.</li>
              <li>Нажми «Считать» — данные попадут в консоль для проверки.</li>
            </ol>
          </article>
          <article>
            <h3>План на месяц</h3>
            <p>
              Сейчас работает три точки. Четвертая появится через месяц — для нее уже зарезервирована отдельная карточка в
              конце списка, чтобы ты мог добавить новых сотрудников без переделки интерфейса.
            </p>
          </article>
        </section>

        <section className={styles.locationsGrid}>
          {locations.map((location) => (
            <LocationSection key={location.id} location={location} />
          ))}

          <div className={styles.upcomingCard}>
            <p className={styles.upcomingLabel}>Скоро</p>
            <h3>Точка №4</h3>
            <p>
              Как только добавишь четвертую точку в JSON, она появится здесь автоматически. Карточка уже следует общей
              сетке, поэтому дизайн останется цельным.
            </p>
            <button type="button" className={styles.upcomingButton}>
              Добавить точку
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
