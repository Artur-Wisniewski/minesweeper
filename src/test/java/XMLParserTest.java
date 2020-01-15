
import org.junit.Before;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import xml.XmlConfigurationParser;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class XMLParserTest {
    XmlConfigurationParser parser;

    @BeforeEach
    void initAll() throws Exception {
        parser = new XmlConfigurationParser("webSocketConfiguration.xml");

    }
    @Test
    void testGetApplicationDestinationPrefix() {
        assertEquals("/app", parser.getMessageBrokerApplicationDestinationPrefix());

    }
    @Test
    void testGetWebsocketStompEndpoint() {
        assertEquals("/ws", parser.getStompEndPointPath());
    }
    @Test
    void testGetWebSocketBrokerChannel() {
        assertEquals("/channel", parser.getSimpleBrokerPrefixs().get(0));
    }
    @Test
    void testGetWebSocketBrokerGame() {
        assertEquals("/game", parser.getSimpleBrokerPrefixs().get(1));

    }

}
