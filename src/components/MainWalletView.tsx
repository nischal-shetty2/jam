import { useEffect, useState, useMemo } from 'react'
import * as rb from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useServiceInfo } from '../context/ServiceInfoContext'
import { useSettings, useSettingsDispatch } from '../context/SettingsContext'
import { CurrentWallet, useCurrentWalletInfo, useReloadCurrentWalletInfo } from '../context/WalletContext'
import * as Api from '../libs/JmWalletApi'
import { routes } from '../constants/routes'
import Balance from './Balance'
import Sprite from './Sprite'
import { ExtendedLink } from './ExtendedLink'
import { JarDetailsOverlay } from './jar_details/JarDetailsOverlay'
import { Jars } from './Jars'
import styles from './MainWalletView.module.css'

interface WalletHeaderProps {
  walletName: string
  balance: Api.AmountSats
  unit: Unit
  showBalance: boolean
}

const WalletHeader = ({ walletName, balance, unit, showBalance }: WalletHeaderProps) => {
  return (
    <div className={styles.walletHeader}>
      <h1 className="text-secondary fs-6">{walletName}</h1>
      <h2>
        <Balance
          valueString={balance.toString()}
          convertToUnit={unit}
          showBalance={showBalance}
          enableVisibilityToggle={false}
        />
      </h2>
    </div>
  )
}

const WalletHeaderPlaceholder = () => {
  return (
    <div className={styles.walletHeader}>
      <rb.Placeholder as="div" animation="wave">
        <rb.Placeholder className={styles.titlePlaceholder} />
      </rb.Placeholder>
      <rb.Placeholder as="div" animation="wave">
        <rb.Placeholder className={styles.subtitlePlaceholder} />
      </rb.Placeholder>
    </div>
  )
}

const WalletHeaderRescanning = ({ walletName, isLoading }: { walletName: string; isLoading: boolean }) => {
  const { t } = useTranslation()
  return (
    <div className={styles.walletHeader}>
      <h1 className="text-secondary fs-6">{walletName}</h1>
      {isLoading ? (
        <rb.Placeholder as="div" animation="wave">
          <rb.Placeholder className={styles.subtitlePlaceholder} />
        </rb.Placeholder>
      ) : (
        <h2>{t('current_wallet.text_rescan_in_progress')}</h2>
      )}
    </div>
  )
}

interface MainWalletViewProps {
  wallet: CurrentWallet
}

export default function MainWalletView({ wallet }: MainWalletViewProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const serviceInfo = useServiceInfo()
  const settings = useSettings()
  const settingsDispatch = useSettingsDispatch()
  const currentWalletInfo = useCurrentWalletInfo()
  const reloadCurrentWalletInfo = useReloadCurrentWalletInfo()

  const [alert, setAlert] = useState<SimpleAlert>()
  const [isLoading, setIsLoading] = useState(true)
  const [showJars, setShowJars] = useState(false)

  const jars = useMemo(() => currentWalletInfo?.data.display.walletinfo.accounts, [currentWalletInfo])

  const [selectedJarIndex, setSelectedJarIndex] = useState(0)
  const [isAccountOverlayShown, setIsAccountOverlayShown] = useState(false)

  const onJarClicked = (jarIndex: JarIndex) => {
    if (jarIndex === 0) {
      const isEmpty = currentWalletInfo?.balanceSummary.accountBalances[jarIndex]?.calculatedTotalBalanceInSats === 0

      if (isEmpty) {
        navigate(routes.receive, { state: { account: jarIndex } })
        return
      }
    }

    setSelectedJarIndex(jarIndex)
    setIsAccountOverlayShown(true)
  }

  useEffect(() => {
    const abortCtrl = new AbortController()

    setAlert(undefined)
    setIsLoading(true)

    reloadCurrentWalletInfo
      .reloadUtxos({ signal: abortCtrl.signal })
      .catch((err) => {
        if (abortCtrl.signal.aborted) return
        const message = err.message || t('current_wallet.error_loading_failed')
        setAlert({ variant: 'danger', message })
      })
      .finally(() => {
        if (abortCtrl.signal.aborted) return
        setIsLoading(false)
      })

    return () => abortCtrl.abort()
  }, [reloadCurrentWalletInfo, t])

  return (
    <div>
      {alert && (
        <rb.Row>
          <rb.Col>
            <rb.Alert variant={alert.variant}>{alert.message}</rb.Alert>
          </rb.Col>
        </rb.Row>
      )}

      {currentWalletInfo && jars && (
        <JarDetailsOverlay
          jars={jars}
          initialJarIndex={selectedJarIndex}
          walletInfo={currentWalletInfo}
          wallet={wallet}
          isShown={isAccountOverlayShown}
          onHide={() => setIsAccountOverlayShown(false)}
        />
      )}
      {serviceInfo?.rescanning === true ? (
        <rb.Row>
          <WalletHeaderRescanning walletName={wallet.displayName} isLoading={isLoading} />
        </rb.Row>
      ) : !currentWalletInfo || isLoading ? (
        <rb.Row>
          <WalletHeaderPlaceholder />
        </rb.Row>
      ) : (
        <rb.Row
          className="cursor-pointer"
          onClick={() => {
            if (!settings.showBalance) {
              settingsDispatch({ unit: 'BTC', showBalance: true })
            } else if (settings.unit === 'BTC') {
              settingsDispatch({ unit: 'sats', showBalance: true })
            } else {
              settingsDispatch({ unit: 'BTC', showBalance: false })
            }
          }}
        >
          <WalletHeader
            walletName={wallet.displayName}
            balance={currentWalletInfo.balanceSummary.calculatedTotalBalanceInSats}
            unit={settings.unit}
            showBalance={settings.showBalance}
          />
        </rb.Row>
      )}
      <div className={styles.walletBody}>
        <rb.Row className="mt-4 mb-5 d-flex justify-content-center">
          <rb.Col xs={10} md={8}>
            <rb.Row>
              <rb.Col>
                {/* Always receive to first jar. */}
                <ExtendedLink
                  to={routes.receive}
                  state={{ account: 0 }}
                  className={`${styles.sendReceiveButton} btn btn-lg btn-outline-dark w-100`}
                  disabled={isLoading || serviceInfo?.rescanning}
                >
                  <div className="d-flex justify-content-center align-items-center">
                    <Sprite symbol="receive" width="24" height="24" className="me-1" />
                    {t('current_wallet.button_deposit')}
                  </div>
                </ExtendedLink>
              </rb.Col>
              <rb.Col>
                <ExtendedLink
                  to={routes.send}
                  className={`${styles.sendReceiveButton} btn btn-lg btn-outline-dark w-100`}
                  disabled={isLoading || serviceInfo?.rescanning}
                >
                  <div className="d-flex justify-content-center align-items-center">
                    <Sprite symbol="send" width="24" height="24" className="me-1" />
                    {t('current_wallet.button_withdraw')}
                  </div>
                </ExtendedLink>
              </rb.Col>
            </rb.Row>
          </rb.Col>
        </rb.Row>
        <rb.Collapse in={!serviceInfo?.rescanning && showJars}>
          <rb.Row>
            <div className="mb-5">
              <div>
                {!currentWalletInfo || isLoading ? (
                  <rb.Placeholder as="div" animation="wave">
                    <rb.Placeholder className={styles.jarsPlaceholder} />
                  </rb.Placeholder>
                ) : (
                  <Jars
                    size="lg"
                    accountBalances={currentWalletInfo.balanceSummary.accountBalances}
                    totalBalance={currentWalletInfo.balanceSummary.calculatedTotalBalanceInSats}
                    onClick={onJarClicked}
                  />
                )}
              </div>
            </div>
          </rb.Row>
        </rb.Collapse>
        <rb.Row className="d-flex justify-content-center">
          <rb.Col xs={showJars ? 12 : 10} md={showJars ? 12 : 8}>
            <div className={styles.jarsDividerContainer}>
              <hr className={styles.dividerLine} />
              <button
                className={styles.dividerButton}
                disabled={serviceInfo?.rescanning}
                onClick={() => setShowJars((current) => !current)}
              >
                <Sprite symbol={showJars ? 'caret-up' : 'caret-down'} width="20" height="20" />
              </button>
              <hr className={styles.dividerLine} />
            </div>
          </rb.Col>
        </rb.Row>
      </div>
    </div>
  )
}
