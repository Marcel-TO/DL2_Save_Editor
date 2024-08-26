import { Store } from "tauri-plugin-store-api";
import { AppSettings } from "./settings-model";
import { useState } from "react";
import { Theme } from "@/components/ui/theme-provider";

export const initializeStore = async (
  appSettings: AppSettings
): Promise<Store> => {
  let store = new Store(".settings.dat");
  let defaultStorageKey = "default-settings";

  let storedTheme = await store.get<{ value: Theme }>(
    appSettings.theme.storageKey ?? defaultStorageKey
  );
  if (storedTheme) {
    appSettings.theme.setValue(storedTheme.value);
  } else {
    await store.set(appSettings.theme.storageKey ?? defaultStorageKey, {
      value: appSettings.theme.value,
    });
  }

  let storedCrcValue = await store.get<{ value: boolean }>(
    appSettings.crc.storageKey ?? defaultStorageKey
  );
  if (storedCrcValue) {
    appSettings.crc.setValue(storedCrcValue.value);
  } else {
    await store.set(appSettings.crc.storageKey ?? defaultStorageKey, {
      value: appSettings.crc.value,
    });
  }

  let storedGameFolderPath = await store.get<{ value: string }>(
    appSettings.gameFolderPath.storageKey ?? defaultStorageKey
  );
  if (storedGameFolderPath) {
    appSettings.gameFolderPath.setValue(storedGameFolderPath.value);
  } else {
    await store.set(
      appSettings.gameFolderPath.storageKey ?? defaultStorageKey,
      { value: appSettings.gameFolderPath.value }
    );
  }

  let storedIsDebugging = await store.get<{ value: boolean }>(
    appSettings.isDebugging.storageKey ?? defaultStorageKey
  );
  if (storedIsDebugging) {
    appSettings.isDebugging.setValue(storedIsDebugging.value);
  } else {
    await store.set(appSettings.isDebugging.storageKey ?? defaultStorageKey, {
      value: appSettings.isDebugging.value,
    });
  }

  let storedHasAutomaticBackup = await store.get<{ value: boolean }>(
    appSettings.hasAutomaticBackup.storageKey ?? defaultStorageKey
  );
  if (storedHasAutomaticBackup) {
    appSettings.hasAutomaticBackup.setValue(storedHasAutomaticBackup.value);
  } else {
    await store.set(
      appSettings.hasAutomaticBackup.storageKey ?? defaultStorageKey,
      { value: appSettings.hasAutomaticBackup.value }
    );
  }

  await store.save();
  return store;
};

export const initializeAppSettings = (): AppSettings => {
  const [theme, setTheme] = useState<Theme>("dl2");
  const [crcValue, setCrcValue] = useState<boolean>(false);
  const [gameFolderPath, setGameFolderPath] = useState<string>("");
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [hasAutomaticBackup, setHasAutomaticBackup] = useState<boolean>(false);

  return {
    theme: {
      value: theme,
      setValue: setTheme,
      storageKey: "vite-ui-theme",
    },
    crc: {
      value: crcValue,
      setValue: setCrcValue,
      storageKey: "crc-check-settings",
    },
    gameFolderPath: {
      value: gameFolderPath,
      setValue: setGameFolderPath,
      storageKey: "game-folder-settings",
    },
    isDebugging: {
      value: isDebugging,
      setValue: setIsDebugging,
      storageKey: "debug-settings",
    },
    hasAutomaticBackup: {
      value: hasAutomaticBackup,
      setValue: setHasAutomaticBackup,
      storageKey: "backup-settings",
    },
  };
};