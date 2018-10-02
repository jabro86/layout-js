import * as React from "react";
import styled from "react-emotion";

const Container = styled("div")`
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  overflow: hidden;
`;

interface Props {
  model: any;
}

export function Layout(props: Props): JSX.Element {
  return (
    <Container>
      <pre>{JSON.stringify(props.model, null, 2)}</pre>
    </Container>
  );
}
