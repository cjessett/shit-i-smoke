import React from 'react';

export default class About extends React.Component {
  constructor() {
    super();
    this.state = { visible: false };
    this.display = this.display.bind(this);
  }

  display() {
    this.setState({ visible: true });
  }

  render() {
    const { visible } = this.state;
    if (!visible) return <a href="#about" onClick={this.display}>Click to understand how we did the math</a>;
    return (
      <div className="container">
        <p className="container-item">
          This app was inspired by Berkeley Earth’s findings about the <a
            className="link"
            href="http://berkeleyearth.org/air-pollution-and-cigarette-equivalence/"
          >equivalence between air pollution and cigarette smoking</a>.
          The rule of thumb is simple: one cigarette per day is roughly the
          equivalent of a PM2.5 level of 22 &micro; g/m.
        </p>
      </div>
    );
  }
}
