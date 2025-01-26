// ResumeDocument.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ExportData, DesignConfig } from "@/types/export";

// Вынесение регистрации шрифта в отдельный модуль
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

interface ResumeDocumentProps {
  data: ExportData;
  username: string;
  designConfig: DesignConfig;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  data,
  username,
  designConfig,
}) => {
  const styles = createStyles(designConfig);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <HeaderSection username={username} styles={styles} />
        <SkillsSection data={data} styles={styles} />
        <ProjectsSection data={data} styles={styles} />
      </Page>
    </Document>
  );
};

// Вынесение секций в отдельные компоненты
const HeaderSection = ({
  username,
  styles,
}: {
  username: string;
  styles: any;
}) => (
  <View style={styles.section}>
    <Text style={styles.header}>Resume for {username}</Text>
  </View>
);

const SkillsSection = ({ data, styles }: { data: ExportData; styles: any }) => (
  <View style={styles.section}>
    <Text style={styles.subheader}>Skills</Text>
    {Object.entries(data.skills).map(([skill, value]) => (
      <View key={skill} style={styles.skillsTable}>
        <Text style={[styles.text, styles.skillName]}>{skill}</Text>
        <Text style={[styles.text, styles.skillValue]}>{value}%</Text>
      </View>
    ))}
  </View>
);

const ProjectsSection = ({
  data,
  styles,
}: {
  data: ExportData;
  styles: any;
}) => (
  <View style={styles.section}>
    <Text style={styles.subheader}>Projects</Text>
    {data.projects.map((project, index) => (
      <View key={index} style={{ marginBottom: 10 }}>
        <Text style={[styles.text, { fontWeight: "bold" }]}>
          {project.name}
        </Text>
        <Text style={styles.text}>{project.description}</Text>
      </View>
    ))}
  </View>
);

const createStyles = (designConfig: DesignConfig) =>
  StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#FFFFFA",
      padding: 30,
      fontFamily: "Roboto",
    },
    section: {
      margin: 10,
      padding: 10,
    },
    header: {
      fontSize: 24,
      marginBottom: 10,
      color: designConfig.headerColor,
    },
    subheader: {
      fontSize: 18,
      marginBottom: 5,
      color: designConfig.subHeaderColor,
    },
    text: {
      fontSize: 12,
      marginBottom: 5,
      color: designConfig.textColor,
    },
    skillsTable: {
      display: "flex",
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: designConfig.subHeaderColor,
      marginBottom: 5,
    },
    skillName: {
      width: "70%",
    },
    skillValue: {
      width: "30%",
    },
  });
