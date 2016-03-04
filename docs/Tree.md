# PostHTML Tree
## Example (JSON tree)
### HTML

```html
<a class="animals" href="#">
    <span class="animals__cat" style="background: url(cat.png)">Cat</span>
</a>
```

### Tree in PostHTML (PostHTMLTree)

```js
[{
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
}]
```
