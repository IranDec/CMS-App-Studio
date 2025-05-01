
/**
 * @fileOverview Centralized default configuration values for widgets.
 */

import type { DroppedWidget } from '@/types/widget';

// Type assertion to ensure the map covers all expected widget types (compile-time check)
// Note: Header doesn't use BaseWidgetConfig directly, so its defaults are separate
type WidgetDefaultsMap = {
    [key in Exclude<DroppedWidget['type'], 'header'>]: Partial<DroppedWidget['config']>;
} & {
    header: Partial<DroppedWidget['config']>; // Add header specifically
};


export const widgetDefaultValuesMap: WidgetDefaultsMap = {
    header: {
        title: 'App Name',
        showBackButton: false,
        showMenuButton: true,
        showCartIcon: true,
        showAuthButton: true,
        authButtonText: 'Login',
        // Headers usually don't have margins like other content blocks
        marginTop: 0,
        marginBottom: 0,
    },
    banner: {
        imageUrl: 'https://picsum.photos/seed/banner_default/600/200', // Added default image
        altText: 'Default Banner Image',
        linkUrl: '',
        marginTop: 2,
        marginBottom: 2,
        imageFit: 'cover',
        aspectRatio: '16/9',
    },
    grid: {
        columns: '2',
        gap: 4, // Default gap increased
        dataSource: '', // Keep empty, prompt user to configure
        marginTop: 2,
        marginBottom: 2,
        itemAspectRatio: '1/1',
    },
    list: {
        itemLayout: 'simple',
        showDividers: true,
        dataSource: '', // Keep empty, prompt user to configure
        marginTop: 2,
        marginBottom: 2,
        imageSize: 'md',
    },
    form: {
        submitButtonText: 'Submit',
        recipientEmail: '',
        successMessage: 'Thank you for your submission!',
        marginTop: 2,
        marginBottom: 2,
    },
    text: {
        content: 'This is a sample text block. Edit me!', // Improved default text
        fontSize: 'base',
        alignment: 'left',
        isBold: false,
        isItalic: false,
        marginTop: 2,
        marginBottom: 2,
        textColor: 'default',
    },
    button: {
        buttonText: 'Learn More', // Improved default text
        linkUrl: '',
        variant: 'default',
        size: 'default',
        alignment: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    spacer: {
        // Spacers usually don't need margins themselves, they provide space
        height: 4,
        marginTop: 0, // Default margin 0 for spacer
        marginBottom: 0, // Default margin 0 for spacer
    },
    map: {
        address: '1 Infinite Loop, Cupertino, CA', // Updated default address
        zoomLevel: 15,
        showMarker: true,
        mapStyle: 'roadmap',
        marginTop: 2,
        marginBottom: 2,
    },
    video: {
        videoUrl: '', // Keep empty, prompt user
        aspectRatio: '16/9',
        autoplay: false,
        showControls: true,
        marginTop: 2,
        marginBottom: 2,
    },
    // Add defaults for any new widget types here
};

