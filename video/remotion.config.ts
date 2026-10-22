import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Duas abas e até 2 minutos por delayRender(): com quatro abas e o limite padrão de 30 s, o render parou duas vezes
// no carregamento do manifest e da fonte (Lote 37). Nenhum dos dois muda um pixel dos quadros.
Config.setConcurrency(2);
Config.setDelayRenderTimeoutInMilliseconds(120000);
