/**
 * Builds document-embedded map using c2corg maps API.
 */

Ext.namespace("c2corg");

c2corg.embeddedMap = (function() {
    
    if (!objectsToShow) return;

    var wkt_parser = new OpenLayers.Format.WKT();
    var features = [];
    for (var i = 0, len = objectsToShow.length; i < len; i++) {
        var obj = objectsToShow[i];
        // TODO: use simplified WKT?
        var f = wkt_parser.read(obj.wkt);
        f.fid = obj.id;
        f.attributes = {type: obj.type};
        if (obj.type == "routes" || obj.type == "outings" || obj.type == "areas" || obj.type == "maps") {
            f.style = {
                strokeColor: "yellow",
                strokeWidth: 1,
                fillColor: "yellow",
                fillOpacity: 0.1
            };
        } else {
            f.style = {
                pointRadius: 10,
                externalGraphic: '/static/images/modules/' + obj.type + '_mini.png'
                // FIXME: ${type} syntax seems not to work
            };
        }
        features.push(f);
    }
    
    var api = new c2corg.API({lang: mapLang}); // mapLang is defined in HTML document
    api.createMap();
    
    var drawingLayer = api.getDrawingLayer();
    drawingLayer.addFeatures(features);
    
    if (features.length == 1 && features[0].geometry instanceof OpenLayers.Geometry.Point) {
        var center = features[0].geometry;
        api.map.setCenter(new OpenLayers.LonLat(center.x, center.y), 12);
    } else {
        api.map.zoomToExtent(drawingLayer.getDataExtent());
        var extent = api.map.getExtent();
    }
    
    var initialCenter = api.map.getCenter();
    var initialZoom = api.map.getZoom();
    
    var bbar = api.createBbar();
    
    var addPermalinkButton = function() {
        var permalinkDiv = document.createElement("div");
        permalinkDiv.id = 'permalink' + api.apiId;
        Ext.getBody().appendChild(permalinkDiv);
        api.addPermalinkControl();
        bbar.add(new Ext.Action({
            text: OpenLayers.i18n('Expand map'),
            handler: function() {
                window.open(Ext.get('permalink' + api.apiId).dom.value);
            }
        }));
    };
    
    var addResetButton = function() {
        bbar.add(new Ext.Action({
            text: OpenLayers.i18n('Reset'),
            handler: function() {
                var center = initialCenter.clone();
                api.map.setCenter(center.transform(api.epsg900913, api.map.getProjectionObject()),
                                  initialZoom); // FIXME: zoom changes depending on base layer resolutions nb
            }
        }));
    };
    
    var mappanel = Ext.apply(api.createMapPanel(), {
        id: 'mappanel',
        margins: '0 0 0 0',
        region: 'center',
        border: false,
        bbar: bbar
    });
    
    var layertree = Ext.apply(api.createLayerTree(), {
        region: 'west',
        width: 250,
        border: false,
        collapsible: true,
        collapseMode: 'mini',
        split: true
    });
    
    return {
        init: function() {
            // hide loading message
            Ext.removeNode(Ext.getDom('mapLoading'));
            
            new Ext.Panel({
                applyTo: 'map',
                layout: 'border',
                border: false,
                cls: 'embeddedMap',
                items: [ mappanel, layertree ]
            });
            
            // FIXME: done here else the zoom level is incorrect (changed when creating panel?)
            if (extent) {
                api.map.zoomToExtent(extent);
                initialZoom = api.map.getZoom();
            }
            
            addResetButton();
            addPermalinkButton();
        }
    };
})();

Ext.onReady(c2corg.embeddedMap.init);