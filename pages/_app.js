import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Home.module.css'; // Include custom CSS

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}