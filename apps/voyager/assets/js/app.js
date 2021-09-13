// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import '../css/app.scss';

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import 'phoenix_html';
import { Socket } from 'phoenix';
import NProgress from 'nprogress';
import { LiveSocket } from 'phoenix_live_view';
import ReactPhoenix from 'react-phoenix';
import LoginPage from '@/LoginPage';
import MetadataFormPage from '@/MetadataFormPage';
import MetadataPage from '@/MetadataPage';
import SnackbarProvider from '@/SnackbarProvider';
import Drawer from '@/_components/Drawer';
import RegisterPage from '@/RegisterPage';
import RunPage from '@/RunPage';
import RunFormPage from '@/RunFormPage';

import ProjectStatusPage from '@/ProjectStatusPage';
import DashboardPage from '@/DashboardPage';
import FAQPage from '@/FaqPage';

// Define a `hooks` variable to keep all our defined LiveView hooks:
let hooks = { ReactPhoenix };

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute('content');
let liveSocket = new LiveSocket('/live', Socket, { hooks, params: { _csrf_token: csrfToken } });

// Show progress bar on live navigation and form submits
window.addEventListener('phx:page-loading-start', (info) => NProgress.start());
window.addEventListener('phx:page-loading-stop', (info) => NProgress.done());

// connect if there are any LiveViews on the page
liveSocket.connect();

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket;
window.Components = {
    Drawer,
    LoginPage,
    SnackbarProvider,
    MetadataFormPage,
    MetadataPage,
    RegisterPage,
    RunPage,
    RunFormPage,
    ProjectStatusPage,
    DashboardPage,
    FAQPage,
};
