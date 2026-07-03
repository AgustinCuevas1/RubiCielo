$root = Join-Path $PSScriptRoot 'all-products'
$map = @{
  'anillo-gloria' = @{name='Anillo Gloria'; price='7100'}
  'charm-luna' = @{name='Charm Luna'; price='3900'}
  'collar-charm' = @{name='Collar Charm'; price='6800'}
  'collar-flora' = @{name='Collar Flora'; price='8500'}
  'conjunto-rubyhome' = @{name='Conjunto RubyHome'; price='10500'}
  'pulsera-diseno' = @{name='Pulsera Diseño'; price='5800'}
  'pulsera-flora' = @{name='Pulsera Flora'; price='4700'}
  'pulsera-kairos' = @{name='Pulsera Kairos'; price='6200'}
}

$popup = @'
    <div class="cart-popup" id="cartPopup" aria-hidden="true">
      <div class="cart-popup__backdrop" id="cartBackdrop" tabindex="-1"></div>
      <div class="cart-popup__content" role="dialog" aria-modal="true">
        <div class="cart-popup__header">
          <h2>Carrito</h2>
          <button class="cart-popup__close" id="closeCart" aria-label="Cerrar carrito">×</button>
        </div>
        <div class="cart-popup__body">
          <div class="cart-popup__items" id="cartItems"></div>
        </div>
        <div class="cart-popup__footer">
          <div class="cart-popup__total">
            <span>Total</span>
            <strong id="cartTotal">$0</strong>
          </div>
          <a class="btn-whatsapp--cart" id="cartWhatsapp" href="https://wa.me/549498400377" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
        </div>
      </div>
    </div>
'@

Get-ChildItem -Path $root -Directory | ForEach-Object {
  $file = Join-Path $_.FullName 'index.html'
  if (-not (Test-Path $file)) { return }
  $text = Get-Content -Path $file -Raw

  # add shared product stylesheet
  $text = $text -replace '<link rel="stylesheet" href="\.\./\.\./styles\.css" />\r?\n(\s*<link rel="stylesheet" href="styles\.css" />)', '<link rel="stylesheet" href="../../styles.css" />\r\n    <link rel="stylesheet" href="../product.css" />\r\n    $1'

  # add cart button in header nav
  $text = $text -replace '(<nav class="header__nav">\r?\n\s*<ul class="header__nav-ul">[\s\S]*?<\/ul>\r?\n\s*<\/nav>)', [regex]::Replace('$1', '<\/ul>\r\n\s*<\/nav>', '</ul>\r\n        <button type="button" class="contenedor__carrito" aria-label="Ver carrito">🛒<span id="count-carrito">0</span></button>\r\n      </nav>')

  # convert existing action links to add-to-cart button and return button
  $text = $text -replace '<a href="../../products/index.html" class="btn__main">(Volver a Productos|Añadir al Carrito)<\/a>', '<div class="product-detail-actions">\r\n            <a href="../../products/index.html" class="btn__secondary">Volver a Productos</a>\r\n            <button type="button" id="addToCartButton" class="btn__main">Agregar al carrito</button>\r\n          </div>'

  # add product metadata to main
  $name = $map[$_.Name].name
  $price = $map[$_.Name].price
  $text = $text -replace '<main class="product-detail-main">', "<main class=\"product-detail-main\" data-product-name=\"$name\" data-product-price=\"$price\">"

  # insert popup before footer
  $text = $text -replace '</main>\r?\n\r?\n\s*<footer>', "</main>`r`n$popup`r`n    <footer>"

  # add cart script before closing body
  if (-not ($text -match '<script src="\.\./cart\.js" defer><\/script>')) {
    $text = $text -replace '</footer>\r?\n\s*</body>', '</footer>`r`n    <script src="../cart.js" defer></script>`r`n  </body>'
  }

  Set-Content -Path $file -Value $text
}

$cssFile = Join-Path $root 'product.css'
$css = Get-Content -Path $cssFile -Raw
$css = $css -replace '\.contenedor__carrito \{[\s\S]*?\}', '.contenedor__carrito {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 2px solid #7a2f6f;
  background: white;
  color: #7a2f6f;
  font-weight: 700;
  cursor: pointer;
}

.contenedor__carrito:hover {
  opacity: 0.9;
}

#count-carrito {
  font-size: 0.82rem;
  color: #7a2f6f;
  background: #f9d5ff;
  border-radius: 999px;
  padding: 0.15rem 0.45rem;
}
'

if ($css -notmatch '\.product-detail-actions \{') {
  $css = $css + "`r`n.product-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}
"
}
Set-Content -Path $cssFile -Value $css
