# PostHTML Tree

## Format

### HTML

```html
<a class="animals" href="#">
  <span class="animals__cat" style="background: url(cat.png)">Cat</span>
</a>
```

### JSON

```js
[
  {
    tag: 'a',
    attrs: {
      class: 'animals',
      href: '#'
    },
    content: [
      '\n    ',
      {
        tag: 'span',
        attrs: {
          class: 'animals__cat',
          style: 'background: url(cat.png)'
        },
        content: ['Cat']
      },
      '\n'
    ]
  }
]
```
