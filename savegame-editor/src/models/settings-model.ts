import { Theme } from '@/components/ui/theme-provider';
import { Dispatch, SetStateAction } from 'react';

export type SettingState<T> = {
    value: T;
    setValue: Dispatch<SetStateAction<T>>;
    storageKey?: string;
};

export type AppSettings = {
    theme: SettingState<Theme>;
    crc: SettingState<boolean>;
    gameFolderPath: SettingState<string>;
    isDebugging: SettingState<boolean>;
    hasAutomaticBackup: SettingState<boolean>;
};