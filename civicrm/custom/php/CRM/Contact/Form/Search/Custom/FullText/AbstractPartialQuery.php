<?php
/*
 +--------------------------------------------------------------------+
 | CiviCRM version 4.5                                                |
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC (c) 2004-2014                                |
 +--------------------------------------------------------------------+
 | This file is a part of CiviCRM.                                    |
 |                                                                    |
 | CiviCRM is free software; you can copy, modify, and distribute it  |
 | under the terms of the GNU Affero General Public License           |
 | Version 3, 19 November 2007 and the CiviCRM Licensing Exception.   |
 |                                                                    |
 | CiviCRM is distributed in the hope that it will be useful, but     |
 | WITHOUT ANY WARRANTY; without even the implied warranty of         |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.               |
 | See the GNU Affero General Public License for more details.        |
 |                                                                    |
 | You should have received a copy of the GNU Affero General Public   |
 | License and the CiviCRM Licensing Exception along                  |
 | with this program; if not, contact CiviCRM LLC                     |
 | at info[AT]civicrm[DOT]org. If you have questions about the        |
 | GNU Affero General Public License or the licensing of CiviCRM,     |
 | see the CiviCRM license FAQ at http://civicrm.org/licensing        |
 +--------------------------------------------------------------------+
*/

/**
 *
 * @package CRM
 * @copyright CiviCRM LLC (c) 2004-2014
 * $Id$
 *
 */
abstract class CRM_Contact_Form_Search_Custom_FullText_AbstractPartialQuery {

  /**
   * @var string
   */
  protected $name;

  /**
   * @var string
   */
  protected $label;

  /**
   * @param string $name
   * @param string $label
   */
  public function __construct($name, $label) {
    $this->name = $name;
    $this->label = $label;
  }

  public function getLabel() {
    return $this->label;
  }

  public function getName() {
    return $this->name;
  }

  /**
   * Execute a query and write out a page worth of matches to $detailTable.
   *
   * TODO: Consider removing $entityIDTableName from the function-signature. Each implementation could be
   * responsible for its own temp tables.
   *
   * TODO: Understand why $queryLimit and $detailLimit are different
   *
   * @param string $queryText a string of text to search for
   * @param string $entityIDTableName a temporary table into which we can write a list of all matching IDs
   * @param string $detailTable a table into which we can write details about a page worth of matches
   * @param array|NULL $queryLimit overall limit (applied when building $entityIDTableName)
   *                   NULL if no limit; or array(0 => $limit, 1 => $offset)
   * @param array|NULL $detailLimit final limit (applied when building $detailTable)
   *                   NULL if no limit; or array(0 => $limit, 1 => $offset)
   * @return int number of matches
   */
  public abstract function fillTempTable($queryText, $entityIDTableName, $detailTable, $queryLimit, $detailLimit);

  /**
   * @return bool
   */
  public function isActive() {
    return TRUE;
  }

  /**
   * @param $tables
   * @param $extends
   */
  function fillCustomInfo(&$tables, $extends) {
    $sql = "
SELECT     cg.table_name, cf.column_name
FROM       civicrm_custom_group cg
INNER JOIN civicrm_custom_field cf ON cf.custom_group_id = cg.id
WHERE      cg.extends IN $extends
AND        cg.is_active = 1
AND        cf.is_active = 1
AND        cf.is_searchable = 1
AND        cf.html_type IN ( 'Text', 'TextArea', 'RichTextEditor' )
";

    $dao = CRM_Core_DAO::executeQuery($sql);
    while ($dao->fetch()) {
      if (!array_key_exists($dao->table_name, $tables)) {
        $tables[$dao->table_name] = array(
          'id' => 'entity_id',
          'fields' => array(),
        );
      }
      $tables[$dao->table_name]['fields'][$dao->column_name] = NULL;
    }
  }


  /**
   * @param string $queryText
   * @param array $tables
   * @return int the total number of matches
   */
  function runQueries($queryText, &$tables, $entityIDTableName, $limit) {
    $sql = "TRUNCATE {$entityIDTableName}";
    CRM_Core_DAO::executeQuery($sql);

    foreach ($tables as $tableName => $tableValues) {
      if ($tableName == 'final') {
        continue;
      }
      else {
        if ($tableName == 'sql') {
          foreach ($tableValues as $sqlStatement) {
            $sql = "
REPLACE INTO {$entityIDTableName} ( entity_id )
$sqlStatement
{$this->toLimit($limit)}
";
            CRM_Core_DAO::executeQuery($sql);
          }
        }
        else {
          $fullTextFields = array(); // array (string $sqlColumnName)
          $clauses = array(); // array (string $sqlExpression)

          foreach ($tableValues['fields'] as $fieldName => $fieldType) {
            if ($fieldType == 'Int') {
              if (is_numeric($queryText)) {
                $clauses[] = "$fieldName = {$queryText}";
              }
            }
            else {
              $fullTextFields[] = $fieldName;
            }
          }

          if (!empty($fullTextFields)) {
            $clauses[] = $this->matchText($tableName, $fullTextFields, $queryText);
          }

          if (empty($clauses)) {
            continue;
          }

          $whereClause = implode(' OR ', $clauses);

          //resolve conflict between entity tables.
          if ($tableName == 'civicrm_note' &&
            $entityTable = CRM_Utils_Array::value('entity_table', $tableValues)
          ) {
            $whereClause .= " AND entity_table = '{$entityTable}'";
          }

          $sql = "
REPLACE  INTO {$entityIDTableName} ( entity_id )
SELECT   {$tableValues['id']}
FROM     $tableName
WHERE    ( $whereClause )
AND      {$tableValues['id']} IS NOT NULL
GROUP BY {$tableValues['id']}
{$this->toLimit($limit)}
";
          CRM_Core_DAO::executeQuery($sql);
        }
      }
    }

    if (isset($tables['final'])) {
      foreach ($tables['final'] as $sqlStatement) {
        CRM_Core_DAO::executeQuery($sqlStatement);
      }
    }

    $rowCount = "SELECT count(*) FROM {$entityIDTableName}";
    return CRM_Core_DAO::singleValueQuery($rowCount);
  }

  /**
   * Create a SQL expression for matching against a list of
   * text columns.
   *
   * @param string $table eg "civicrm_note" or "civicrm_note mynote"
   * @param array|string $fullTextFields list of field names
   * @param string $queryText
   * @return string SQL, eg "MATCH (col1) AGAINST (queryText)" or "col1 LIKE '%queryText%'"
   */
  public function matchText($table, $fullTextFields, $queryText) {
    if (strpos($table, ' ') === FALSE) {
      $tableName = $tableAlias = $table;
    } else {
      list ($tableName, $tableAlias) = explode(' ', $table);
    }
    if (is_scalar($fullTextFields)) {
      $fullTextFields = array($fullTextFields);
    }

    $clauses = array();
    if (CRM_Core_InnoDBIndexer::singleton()->hasDeclaredIndex($tableName, $fullTextFields)) {
      $strtolower = function_exists('mb_strtolower') ? 'mb_strtolower' : 'strtolower';

      $prefixedFieldNames = array();
      foreach ($fullTextFields as $fieldName) {
        $prefixedFieldNames[] = "$tableAlias.$fieldName";
      }

      $clauses[] = sprintf("MATCH (%s) AGAINST ('%s')",
        implode(',', $prefixedFieldNames),
        $strtolower(CRM_Core_DAO::escapeString($queryText))
      );
    }
    else {
      //CRM_Core_Session::setStatus(ts('Cannot use FTS for %1 (%2)', array(
      //  1 => $table,
      //  2 => implode(', ', $fullTextFields),
      //)));
      foreach ($fullTextFields as $fieldName) {
        $clauses[] = "$tableAlias.$fieldName LIKE {$this->toSqlWildCard($queryText)}";
      }
    }
    return implode(' OR ', $clauses);
  }

  /**
   * Format text to include wild card characters at beginning and end
   *
   * @param string $text
   * @return string
   */
  public function toSqlWildCard($text) {
    if ($text) {
      $strtolower = function_exists('mb_strtolower') ? 'mb_strtolower' : 'strtolower';
      $text = $strtolower(CRM_Core_DAO::escapeString($text));
      if (strpos($text, '%') === FALSE) {
        $text = "'%{$text}%'";
        return $text;
      }
      else {
        $text = "'{$text}'";
        return $text;
      }
    }
    else {
      $text = "'%'";
      return $text;
    }
  }

  /**
   * @param int|array $limit
   * @return string SQL
   * @see CRM_Contact_Form_Search_Custom_FullText::toLimit
   */
  public function toLimit($limit) {
    if (is_array($limit)) {
      list ($limit, $offset) = $limit;
    }
    if (empty($limit)) {
      return '';
    }
    $result = "LIMIT {$limit}";
    if ($offset) {
      $result .= " OFFSET {$offset}";
    }
    return $result;
  }

}