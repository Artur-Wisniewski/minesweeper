package xml;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.File;


public class XmlCreator {
     public static <T> void createXml(String path, String nameFile, T toXml) throws JAXBException {
         JAXBContext jaxbContext = JAXBContext.newInstance((Class) toXml);
         Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
         jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
         jaxbMarshaller.marshal(toXml, new File(path + "/" + nameFile));
     }
}
