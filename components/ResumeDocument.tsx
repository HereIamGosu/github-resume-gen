import type React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import type { ExportData, DesignConfig } from "@/types/export"

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
})

interface ResumeDocumentProps {
  data: ExportData
  username: string
  designConfig: DesignConfig
}

const ResumeDocument: React.FC<ResumeDocumentProps> = ({ data, username, designConfig }) => {
  const styles = StyleSheet.create({
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
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Резюме для {username}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Навыки</Text>
          {Object.entries(data.skills).map(([skill, value]) => (
            <View key={skill} style={styles.skillsTable}>
              <Text style={[styles.text, styles.skillName]}>{skill}</Text>
              <Text style={[styles.text, styles.skillValue]}>{value}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.subheader}>Проекты</Text>
          {data.projects.map((project, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={[styles.text, { fontWeight: "bold" }]}>{project.name}</Text>
              <Text style={styles.text}>{project.description}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export default ResumeDocument

