import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import RedBox from 'redbox-react'
import App from './components/App'

const rootEl = document.getElementById('react-root')

try {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    rootEl
  )
} catch (e) {
  ReactDOM.render(
    <RedBox error={e} />,
    rootEl
  )
}

if (module.hot) {
  module.hot.accept('./components/App', () => {
    const NewApp = require('./components/App').default
    try {
      ReactDOM.render(
        <AppContainer>
          <NewApp />
        </AppContainer>,
        rootEl
      )
    } catch (e) {
      ReactDOM.render(
        <RedBox error={e} />,
        rootEl
      )
    }
  })
}
