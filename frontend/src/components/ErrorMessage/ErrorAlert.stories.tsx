import { Meta, StoryFn } from '@storybook/react';
import { Card, Col, Layout, Row } from '@zobi-ui/core/components';
import { ErrorAlert } from './ErrorAlert';

const { Content } = Layout;

const longDescription = `This is a detailed description to test long content display.
Line breaks are included here to demonstrate pre-wrap styling.
This is useful for verbose error messages.`;

const sqlErrorDescription = `SQL Error: Syntax error near unexpected token.
Please check your query and ensure it follows the correct syntax.`;

const detailsExample = `Additional details about the issue are provided here.
This content is shown when the user clicks "Show more".`;

export default {
  title: 'Components/ErrorMessage/ErrorAlert',
  component: ErrorAlert,
} as Meta;

export const Gallery: StoryFn = () => (
  <Layout>
    <Content style={{ padding: '24px' }}>
      <h2>Non-Compact Errors</h2>
      <Row gutter={[16, 16]}>
        <Col xs={48} sm={24} md={16} lg={16} xl={12}>
          <Card>
            <ErrorAlert message="Only message props was passed here" />
          </Card>
        </Col>
        <Col xs={48} sm={24} md={16} lg={16} xl={12}>
          <Card>
            <ErrorAlert
              errorType="Database Connection Error"
              type="warning"
              message="Failed to connect to database"
              descriptionDetails={detailsExample}
              descriptionDetailsCollapsed
            />
          </Card>
        </Col>
        <Col xs={48} sm={24} md={16} lg={16} xl={12}>
          <Card>
            <ErrorAlert
              errorType="Error"
              message="SQL Syntax Error - No defaults set here"
              description={sqlErrorDescription}
              descriptionDetails={detailsExample}
              descriptionDetailsCollapsed
              descriptionPre
            />
          </Card>
        </Col>
        <Col xs={48} sm={24} md={16} lg={16} xl={12}>
          <Card>
            <ErrorAlert
              errorType="Error"
              message="See the details below"
              type="error"
              description={longDescription}
              descriptionDetails={detailsExample}
              descriptionDetailsCollapsed={false}
            />
          </Card>
        </Col>
        <Col xs={48} sm={24} md={16} lg={16} xl={12}>
          <Card>
            <ErrorAlert
              errorType="Informational Warning"
              message="This is a non-pre-wrap styled description"
              type="info"
              description={longDescription}
              descriptionDetails={detailsExample}
              descriptionDetailsCollapsed={false}
              descriptionPre={false}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={6}>
          <Card>
            <ErrorAlert
              errorType="Error"
              message="Something went wrong"
              type="error"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={6}>
          <Card>
            <ErrorAlert
              errorType="Warning"
              message="Be cautious"
              type="warning"
            />
          </Card>
        </Col>
      </Row>
      <h2>Compact Errors (with Modal)</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={8} xl={6}>
          <Card>
            <ErrorAlert
              errorType="Error"
              message="Compact mode example"
              type="error"
              compact
              descriptionDetailsCollapsed
              description={sqlErrorDescription}
              descriptionDetails={detailsExample}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={6}>
          <Card>
            <ErrorAlert
              errorType="Warning"
              message="Compact mode example"
              type="warning"
              compact
              descriptionDetails={detailsExample}
              descriptionDetailsCollapsed
            />
          </Card>
        </Col>
      </Row>
    </Content>
  </Layout>
);
