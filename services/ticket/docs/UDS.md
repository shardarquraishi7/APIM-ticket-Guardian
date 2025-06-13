## UDS extension

> To support UDS' multi-brand capabilities WASK will combine all UDS themes you select into a single UDS extension

### UDS documentation links

- [Telus/Allium](https://telus.github.io/universal-design-system/components/allium)
- [Koodo](https://telus.github.io/universal-design-system/components/koodo)
- [Public Mobile](https://telus.github.io/universal-design-system/components/public-mobile)

### UDS extension setup

This extension will implement the `@telus-uds/components-web` `BaseProvider` and manage your selected themes. To select which theme you wish to render with on a given page with you can use the following pattern:

```jsx
// src/pages/my-page.tsx
import MyPage from '../components/MyPage'

export const getServerSideProps = () => ({
  props: {
    udsTheme: '<allium | koodo | publicMobile | ...>'
  }
})
// or
export const getStaticProps = () => ({
  props: {
    udsTheme: '<allium | koodo | publicMobile | ...>'
  }
})

export default MyPage
```

### How this works

When installing any UDS extension `create-web-app` will generate a fresh `theme.ts` file in the `UDS` app partial(`src/components/App/partials/UDS/theme.ts`), This file will hold all import logic for theming, fonts and handle mapping theme values to specific themes. The file contents will be similar to the following:

```tsx
// src/components/App/partials/UDS/theme.ts
import '@telus-uds/palette-allium/build/web/fonts/fonts-cdn.css'
import '@telus-uds/palette-koodo/build/web/fonts/fonts-cdn.css'
import alliumTheme from '@telus-uds/theme-allium'
import koodoTheme from '@telus-uds/theme-koodo'

export const DEFAULT_UDS_THEME = 'allium'

// The getServerSideProps/getStaticProps "udsTheme" prop shown above is mapped to these keys.
export const themes = {
  allium: alliumTheme,
  koodo: koodoTheme
  // Add any community themes you wish here.
}

export default function getTheme(themeName = DEFAULT_UDS_THEME) {
  return themes[themeName] ?? themes[DEFAULT_UDS_THEME]
}
```

> You have complete control over adding additional themes to this `theme.ts` file, This includes community themes.

`getTheme` will be called inside of the UDS extensions app partial, the result of that function will be passed to the `@telus-uds/components-web` `BaseProvider` component.

```tsx
export function withUDS(App: NextApp) {
  return function UDSWeb(props: AppProps<UDSAppProps>) {
    const theme = getTheme(props.pageProps?.udsTheme)
    return (
      <BaseProvider defaultTheme={theme}>
        <App {...props} />
      </BaseProvider>
    )
  }
}
```
