declare module 'emoji-mart-vue-fast/src' {
    import { DefineComponent } from 'vue';
    import { EmojiData } from 'emoji-mart';

    export const Picker: DefineComponent<{
        data: any;
        set: string;
        title: string;
        showSkinTones: string;
    }>;

    export const Emoji: DefineComponent <{
        data: any;
        set: string;
        emoji: string;
        size: number;
    }>;

    export class EmojiIndex {
        constructor(data: any);
        search(value: string, options?: any): EmojiData[];
    }
}
