<?php
$module = $sf_context->getModuleName();
$nb_features = count($items);
//if ($nb_features > 0) {
//    $items = Language::parseListItems($items, 'Summit');
//}
$i = 1;

// FIXME: feature partial use Point geometry => what if polygon or line?
?>
{
  "type": "FeatureCollection",
  "features": [
  <?php foreach($items as $feature): ?>
  <?php print_r($feature); die; ?>
    {   
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [<?php echo $feature['lon'] . ', ' . $feature['lat']?>]},
      "properties": {
        "id": <?php echo $feature['id']; ?>, 
        "module": "<?php echo $feature['module']; ?>",
        <?php include_partial($module . '/feature', array('feature' => $feature)); ?>
      },  
      "id": <?php echo $feature['id']; ?>
    }<?php if ($i++ < $nb_features): ?>,<?php endif; ?>
  <?php endforeach; ?>
  ]
}