const STYLES =
`<style>
  body {
    background-color:rgba(255,255,255,0.8);
    font-family: sans-serif;
  }
  p, code {
    font-size:14px;
    color:#000;
    line-height:1;
    margin:3px 3px 6px;
    font-size:1.1rem;
  }
  .type {
    margin-top: 5px;
    font-size:1.2rem;
  }
  </style>`;

const TEMPLATE =
`${STYLES}
{{message}}
</p>
`;


const cp = require('child_process');
const Handlebars = require('handlebars');

class JSHinterError {
  constructor(message){
    console.log('message', message);
    const template = Handlebars.compile(TEMPLATE);
    let data = {
      message: message
    }
    cp.exec(`"$DIALOG" tooltip --transparent --html \
        '${template(data)}\' &> /Users/heathg/Desktop/JSHinterError.out &disown`);
  }
}

module.exports = JSHinterError;
