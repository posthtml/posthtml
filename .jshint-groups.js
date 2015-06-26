module.exports = {
    options : {
        boss : true,
        eqeqeq : true,
        evil : true,
        expr : true,
        forin : true,
        immed : true,
        loopfunc : true,
        maxdepth : 4,
        maxlen : 120,
        noarg : true,
        noempty : true,
        onecase : true,
        quotmark : 'single',
        sub : true,
        supernew : true,
        undef : true,
        unused : true
    },

    groups : {
        nodejs : {
            options : {
                node : true
            },
            includes : ['**/*.js'],
            excludes : [
                'node_modules/**'
            ]
        }
    }
};
