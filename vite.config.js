export default {
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('three')) {
                            return 'vendor_three';
                        }
                        return 'vendor';
                    }
                },
            },
        },
    },
}