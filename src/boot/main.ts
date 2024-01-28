import { Platform } from 'quasar';

const preferences = await window.ipc.getPreferences();

if (Platform.is.win && preferences.fluentUIMode) {
  console.log('Applying Fluent UI styles');
  await import('src/css/fluentui.css');
}
