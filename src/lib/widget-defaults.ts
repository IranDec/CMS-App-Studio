
/**
 * @fileOverview Centralized default configuration values for widgets.
 */

import type { DroppedWidget } from '@/types/widget';

// Type assertion to ensure the map covers all expected widget types (compile-time check)
type WidgetDefaultsMap = {
    [key in DroppedWidget['type']]: Partial<DroppedWidget['config']>;
};


export const widgetDefaultValuesMap: WidgetDefaultsMap = {
    banner: {
        imageUrl: '',
        altText: 'Banner Image',
        linkUrl: '',
        marginTop: 2,
        marginBottom: 2,
        imageFit: 'cover',
        aspectRatio: '16/9',
    },
    grid: {
        columns: '2',
        gap: 4, // Default gap increased
        dataSource: '',
        marginTop: 2,
        marginBottom: 2,
        itemAspectRatio: '1/1',
    },
    list: {
        itemLayout: 'simple',
        showDividers: true,
        dataSource: '',
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
        content: 'Enter your text here...',
        fontSize: 'base',
        alignment: 'left',
        isBold: false,
        isItalic: false,
        marginTop: 2,
        marginBottom: 2,
        textColor: 'default',
    },
    button: {
        buttonText: 'Click Me',
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
        address: '1600 Amphitheatre Parkway, Mountain View, CA',
        zoomLevel: 15,
        showMarker: true,
        mapStyle: 'roadmap',
        marginTop: 2,
        marginBottom: 2,
    },
    video: {
        videoUrl: '',
        aspectRatio: '16/9',
        autoplay: false,
        showControls: true,
        marginTop: 2,
        marginBottom: 2,
    },
    // Add defaults for any new widget types here
};
