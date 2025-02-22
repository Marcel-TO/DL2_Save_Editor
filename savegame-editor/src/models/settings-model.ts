import { Theme } from '@/components/ui/theme-provider';
import { Dispatch, SetStateAction } from 'react';

export type SettingState<T> = {
    value: T;
    setValue: Dispatch<SetStateAction<T>>;
    storageKey?: string;
};

export type DefaultItemLayout = "list" | "grid";

export type DefaultHeaderFont = "drip" | "mono" | "sans";

export type AppSettings = {
    theme: SettingState<Theme>;
    crc: SettingState<boolean>;
    gameFolderPath: SettingState<string>;
    isDebugging: SettingState<boolean>;
    hasAutomaticBackup: SettingState<boolean>;
    defaultItemLayout: SettingState<DefaultItemLayout>;
    defaultHeaderFont: SettingState<DefaultHeaderFont>;
};
