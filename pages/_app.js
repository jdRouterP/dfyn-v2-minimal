import "../styles/globals.css";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import Navbar from  "../components/navbar"
import 'bootstrap/dist/css/bootstrap.css'

const getLibrary = (provider) => {
  return new Web3Provider(provider);
};

function MyApp({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Navbar/>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default MyApp;
